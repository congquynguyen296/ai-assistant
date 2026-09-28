import logging
import os
import psutil

logger = logging.getLogger("mem")
_proc = psutil.Process(os.getpid())
WARN_MB = int(os.getenv("RAM_WARN_MB", "400"))  # ngưỡng cảnh báo, trần Free là 512

def rss_mb() -> float:
    return _proc.memory_info().rss / 1024 / 1024

def log_mem(stage: str, correlation_id: str | None = None) -> float:
    mb = rss_mb()
    level = logging.WARNING if mb >= WARN_MB else logging.INFO
    logger.log(level, "[RAM] stage=%s rss=%.0fMB cid=%s", stage, mb, correlation_id)
    return mb
