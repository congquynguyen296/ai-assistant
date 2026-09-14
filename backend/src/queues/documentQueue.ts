import amqplib from "amqplib";
import mongoose from "mongoose";
import Document from "@/models/Document.js";
import KnowledgeGraph from "@/models/KnowledgeGraph.js";
import Notification from "@/models/Notification.js";
import { ingestDocument } from "@/services/ragClientService.js";
import { generateKnowledgeGraph } from "@/utils/azureAiUtil.js";
import { getIO } from "@/services/socketService.js";

const QUEUE_NAME = "document_processing_queue";
let channel: amqplib.Channel;

export const initRabbitMQ = async () => {
  try {
    const rabbitMqUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";
    const connection = await amqplib.connect(rabbitMqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Start consumer
    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const data = JSON.parse(msg.content.toString());
          await processDocumentJob(data);
          channel.ack(msg);
        } catch (error) {
          console.error("Error processing message:", error);
          // Nack message, but don't requeue if it's a permanent error (simplification)
          channel.nack(msg, false, false); 
        }
      }
    });
    console.log("RabbitMQ consumer initialized.");
  } catch (error) {
    console.error("Failed to initialize RabbitMQ:", error);
  }
};

export const enqueueDocumentProcessing = async (payload: {
  documentId: string;
  userId: string;
  fileName: string;
  text: string;
  chunks: Array<{ content: string; chunkIndex: number }>;
}) => {
  if (!channel) {
    console.error("RabbitMQ channel not initialized. Cannot enqueue job.");
    return;
  }
  
  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
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

const processDocumentJob = async (data: {
  documentId: string;
  userId: string;
  fileName: string;
  text: string;
  chunks: Array<{ content: string; chunkIndex: number }>;
}) => {
  const { documentId, userId, fileName, text, chunks } = data;
  
  try {
    console.log(`Processing document job for ${documentId}`);

    // 1. RAG Ingestion
    try {
      await ingestDocument(documentId, fileName, text);
      
      await createAndSendNotification({
        userId,
        title: "Xử lý tài liệu thành công",
        message: `Hệ thống đã đọc và phân tích tài liệu "${fileName}" thành công. Bạn đã có thể bắt đầu trò chuyện.`,
        type: "success",
        link: `/documents/${documentId}`,
      });
      
      // Update document status to ready
      await Document.findByIdAndUpdate(documentId, { status: "ready" });
    } catch (err) {
      console.error(
        `[RAG] ingestDocument failed for ${documentId}:`,
        (err as Error).message,
      );
      
      await createAndSendNotification({
        userId,
        title: "Lỗi xử lý tài liệu",
        message: `Có lỗi xảy ra khi phân tích tài liệu "${fileName}".`,
        type: "error",
      });
    }

    // 2. Knowledge Graph Generation (Tạm tắt tính năng Network)
    /*
    let graph = await KnowledgeGraph.findOne({ documentId, userId });
    
    if (!graph) {
      graph = new KnowledgeGraph({
        documentId,
        userId,
        status: "processing",
        nodes: [],
        edges: [],
      });
      await graph.save();
    } else {
      graph.status = "processing";
      graph.error = undefined;
      await graph.save();
    }

    try {
      const chunksToProcess = chunks.length > 50 ? chunks.slice(0, 50) : chunks;
      
      const generatedGraph = await generateKnowledgeGraph(chunksToProcess);
      
      const idMap = new Map<string, string>();
      
      generatedGraph.nodes.forEach((node) => {
        idMap.set(node.id, new mongoose.Types.ObjectId().toString());
      });

      const mappedNodes = generatedGraph.nodes.map((node) => ({
        id: idMap.get(node.id)!,
        label: node.label,
        category: node.category,
        importance: node.importance,
        summary: node.summary,
        position: { x: Math.random() * 500, y: Math.random() * 500 }, // Random initial layout
      }));

      const mappedEdges = generatedGraph.edges
        .filter((edge) => idMap.has(edge.from) && idMap.has(edge.to))
        .map((edge) => ({
          id: new mongoose.Types.ObjectId().toString(),
          from: idMap.get(edge.from)!,
          to: idMap.get(edge.to)!,
          label: edge.label,
        }));

      graph.nodes = mappedNodes;
      graph.edges = mappedEdges;
      graph.status = "completed";
      
      const notification = await Notification.create({
        userId,
        title: "Tạo sơ đồ tri thức thành công",
        message: `Hệ thống đã phân tích và tạo mạng tri thức cho tài liệu "${fileName}" thành công.`,
        type: "success",
        link: `/documents/${documentId}?tab=network`,
      });
      
      try {
        const io = getIO();
        io.to(userId).emit("new_notification", notification);
      } catch (err) {
        console.error("Socket error", err);
      }
      
    } catch (graphError) {
      console.error(`Knowledge Graph generation failed for ${documentId}:`, graphError);
      graph.status = "failed";
      graph.error = (graphError as Error).message;
      
      const notification = await Notification.create({
        userId,
        title: "Lỗi tạo sơ đồ tri thức",
        message: `Có lỗi xảy ra khi tạo mạng tri thức cho tài liệu "${fileName}".`,
        type: "error",
      });
      
      try {
        const io = getIO();
        io.to(userId).emit("new_notification", notification);
      } catch (err) {
        console.error("Socket error", err);
      }
    }
    
    await graph.save();
    */

  } catch (error) {
    console.error(`Error in document processing job for ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, { status: "failed" });
    throw error;
  }
};
