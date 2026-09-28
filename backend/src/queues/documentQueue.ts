import amqplib from "amqplib";
import mongoose from "mongoose";
import Document from "@/models/Document.js";
import Notification from "@/models/Notification.js";
import { getIO } from "@/services/socketService.js";
import { deleteDocumentVectors, wakePythonService } from "@/services/ragClientService.js";

const PROCESSING_QUEUE = "document_processing_queue";
const COMPLETED_QUEUE = "document_completed_queue";
const RETRY_QUEUE = "document_retry_queue";

const PROCESSING_EXCHANGE = "processing_exchange";
const RETRY_EXCHANGE = "retry_exchange";

let publishChannel: amqplib.ConfirmChannel;
let consumeChannel: amqplib.Channel;

export const initRabbitMQ = async () => {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    const connection = await amqplib.connect(rabbitMqUrl);

    connection.on("error", (err) => console.error("RabbitMQ Connection Error:", err));
    connection.on("close", () => console.error("RabbitMQ Connection Closed"));

    // 1. Setup Publish Channel (for safe publishing)
    publishChannel = await connection.createConfirmChannel();

    // 2. Setup Consume Channel
    consumeChannel = await connection.createChannel();
    await consumeChannel.prefetch(10); // Fair dispatch for completed queue

    // 3. Declare Topology
    // Exchanges
    await publishChannel.assertExchange(PROCESSING_EXCHANGE, "direct", { durable: true });
    await publishChannel.assertExchange(RETRY_EXCHANGE, "direct", { durable: true });

    // Processing Queue (routes to Retry Exchange on NACK)
    await publishChannel.assertQueue(PROCESSING_QUEUE, {
      durable: true,
      deadLetterExchange: RETRY_EXCHANGE,
      deadLetterRoutingKey: RETRY_QUEUE, // routes DLX messages to retry_queue
    });
    await publishChannel.bindQueue(PROCESSING_QUEUE, PROCESSING_EXCHANGE, PROCESSING_QUEUE);

    // Retry Queue (TTL 60s, routes back to Processing Exchange)
    await publishChannel.assertQueue(RETRY_QUEUE, {
      durable: true,
      messageTtl: 60000, // 60 seconds
      deadLetterExchange: PROCESSING_EXCHANGE,
      deadLetterRoutingKey: PROCESSING_QUEUE,
    });
    await publishChannel.bindQueue(RETRY_QUEUE, RETRY_EXCHANGE, RETRY_QUEUE);

    // Completed Queue
    await publishChannel.assertQueue(COMPLETED_QUEUE, { durable: true });

    // 4. Start Consumer for Completed Queue
    consumeChannel.consume(COMPLETED_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          await handleCompletedJob(data);
          consumeChannel.ack(msg);
        } catch (error) {
          console.error("Error processing completed message:", error);
          consumeChannel.nack(msg, false, false); // If parsing fails, discard it
        }
      }
    });
    
    console.log("RabbitMQ initialized. Topology asserted. Listening to completed queue.");
  } catch (error) {
    console.error("Failed to initialize RabbitMQ:", error);
  }
};

export const enqueueDocumentProcessing = async (payload: {
  documentId: string;
  userId: string;
  fileName: string;
  text: string;
  correlationId?: string;
}) => {
  if (!publishChannel) {
    console.error("RabbitMQ channel not initialized. Cannot enqueue job.");
    throw new Error("RabbitMQ not connected");
  }

  // Ensure message size is relatively small before publishing
  const payloadStr = JSON.stringify({ ...payload, correlationId: payload.correlationId || crypto.randomUUID() });
  const buffer = Buffer.from(payloadStr);

  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error("Tài liệu quá lớn (vượt quá 5MB). Vui lòng tải lên file nhỏ hơn.");
  }

  return new Promise<void>((resolve, reject) => {
    publishChannel.sendToQueue(
      PROCESSING_QUEUE,
      buffer,
      { persistent: true },
      (err, ok) => {
        if (err !== null) {
          console.error("Message nacked by broker:", err);
          reject(err);
        } else {
          wakePythonService();
          resolve();
        }
      }
    );
  });
};

const createAndSendNotification = async (payload: {
  userId: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  link?: string;
}) => {
  const notification = await Notification.create(payload);
  try {
    const io = getIO();
    io.to(payload.userId).emit("new_notification", notification.toJSON());
  } catch (err) {
    console.error("Socket error", err);
  }
  return notification;
};

const handleCompletedJob = async (data: {
  documentId: string;
  userId: string;
  fileName: string;
  status: "ready" | "failed";
  error: any;
}) => {
  const { documentId, userId, fileName, status, error } = data;

  try {
    // 1. Idempotent Update
    const result = await Document.findOneAndUpdate(
      { _id: documentId, status: { $in: ["processing", "failed"] } },
      { status }
    );

    if (result && result.status !== status) {
      // It was updated successfully from a different status
      const updatedName = result.title || result.fileName || fileName;
      if (status === "ready") {
        await createAndSendNotification({
          userId,
          title: "Xử lý tài liệu thành công",
          message: `Hệ thống đã đọc và phân tích tài liệu "${updatedName}" thành công. Bạn đã có thể bắt đầu trò chuyện.`,
          type: "success",
          link: `/documents/${documentId}`,
        });
      } else {
        await createAndSendNotification({
          userId,
          title: "Lỗi xử lý tài liệu",
          message: `Có lỗi xảy ra khi phân tích tài liệu "${updatedName}": ${error || "Lỗi hệ thống"}`,
          type: "error",
        });
      }
    } else if (!result) {
      // 2. Race condition handling: check if document was deleted by user
      const exists = await Document.exists({ _id: documentId });
      if (!exists && status === "ready") {
        console.log(`Document ${documentId} deleted before completion. Removing orphan vectors...`);
        // Non-blocking call to delete vectors in Qdrant via HTTP
        deleteDocumentVectors(documentId).catch(err => {
          console.error(`Failed to delete orphan vectors for ${documentId}:`, err);
        });
      }
    }
  } catch (err) {
    console.error(`Error updating document ${documentId} status:`, err);
    throw err;
  }
};
