import asyncio
import json
import logging
import os

import aio_pika

from mem import log_mem
from app.rag.ingest_service import ingest_text

logger = logging.getLogger("worker")

PROCESSING_QUEUE = "document_processing_queue"
COMPLETED_QUEUE = "document_completed_queue"
JOB_TIMEOUT_S = 300      # timeout cứng cho mỗi lần xử lý
MAX_RETRY = 3

class TransientError(Exception):
    """Lỗi tạm thời: rate limit 429, timeout mạng..."""

class PermanentError(Exception):
    """Lỗi vĩnh viễn: text rỗng, dữ liệu hỏng..."""

def ingest_sync(payload: dict) -> int:
    """Logic hiện có: chunk -> embedding -> upsert Qdrant (uuid5). Trả về số chunk."""
    doc_id = payload.get("documentId")
    file_name = payload.get("fileName")
    text = payload.get("text")
    if not text:
        raise PermanentError("Text is empty")
    try:
        stored, _ = ingest_text(doc_id, file_name, text)
        return stored
    except Exception as e:
        # Wrap unknown errors in TransientError for retry by default,
        # or PermanentError if you have specific parsing logic.
        # For now, we assume all ingest_text errors are transient (network/rate limit).
        raise TransientError(str(e)) from e

def count_rejected(headers) -> int:
    for d in (headers or {}).get("x-death", []):
        if d.get("queue") == PROCESSING_QUEUE and d.get("reason") == "rejected":
            return int(d.get("count", 0))
    return 0

async def publish_result(channel, payload: dict, status: str, error: str | None):
    body = {
        "documentId": payload["documentId"],
        "userId": payload.get("userId"),
        "fileName": payload.get("fileName"),
        "status": status,
        "error": error,
        "correlationId": payload.get("correlationId"),
    }
    await channel.default_exchange.publish(
        aio_pika.Message(
            body=json.dumps(body).encode(),
            delivery_mode=aio_pika.DeliveryMode.PERSISTENT,
            content_type="application/json",
        ),
        routing_key=COMPLETED_QUEUE,
    )

async def handle(message: aio_pika.IncomingMessage, channel):
    try:
        payload = json.loads(message.body)
        payload["documentId"]
    except (json.JSONDecodeError, KeyError) as e:
        logger.error("Message hỏng, bỏ qua: %s", e)
        await message.ack()
        return

    cid = payload.get("correlationId")
    log_mem("job_start", cid)
    try:
        await asyncio.wait_for(asyncio.to_thread(ingest_sync, payload), JOB_TIMEOUT_S)
        await publish_result(channel, payload, "ready", None)
        await message.ack()
    except (TransientError, asyncio.TimeoutError) as e:
        if count_rejected(message.headers) < MAX_RETRY:
            logger.warning("[%s] Lỗi tạm thời, retry: %r", cid, e)
            await message.nack(requeue=False)
        else:
            await publish_result(channel, payload, "failed", f"Hết lượt retry: {e!r}")
            await message.ack()
    except Exception as e:  # PermanentError và lỗi không lường trước
        logger.exception("[%s] Lỗi vĩnh viễn", cid)
        await publish_result(channel, payload, "failed", repr(e))
        await message.ack()
    finally:
        log_mem("job_end", cid)

async def run_worker():
    url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
    connection = await aio_pika.connect_robust(url)
    async with connection:
        channel = await connection.channel()
        await channel.set_qos(prefetch_count=1)
        queue = await channel.declare_queue(PROCESSING_QUEUE, passive=True)
        await channel.declare_queue(COMPLETED_QUEUE, passive=True)
        logger.info("Worker started, consuming %s", PROCESSING_QUEUE)
        async with queue.iterator() as it:
            async for message in it:
                await handle(message, channel)
