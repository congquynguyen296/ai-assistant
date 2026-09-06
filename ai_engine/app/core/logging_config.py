"""
ai_engine/app/core/logging_config.py
Configure logging for file + console outputs using Loguru.
"""
from __future__ import annotations

import logging
import os
import sys
from loguru import logger

from .config import LOG_PATH

class InterceptHandler(logging.Handler):
    """
    Default handler from examples in loguru documentation.
    Intercept standard logging messages and route them to loguru.
    """
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

def setup_logging() -> None:
    log_dir = os.path.dirname(LOG_PATH)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)

    # Remove all default handlers
    logger.remove()

    # Thêm InterceptHandler vào standard logging để hứng log từ Uvicorn/FastAPI
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Log ra console (giữ plain text cho dễ đọc ở dev)
    logger.add(sys.stdout, level="INFO")

    # API Log: Chuyên lưu request/response
    # Sử dụng serialize=True để xuất chuẩn JSON
    api_log_path = os.path.join(log_dir, "api-{time:YYYY-MM-DD}.log")
    logger.add(
        api_log_path,
        rotation="00:00",
        retention="14 days",
        compression="tar.gz",
        serialize=True,
        filter=lambda record: record["extra"].get("type") == "api",
        level="INFO"
    )

    # Application Log: Chuyên lưu log nội bộ, lỗi
    # Filter loại trừ api log
    app_log_path = os.path.join(log_dir, "application-{time:YYYY-MM-DD}.log")
    logger.add(
        app_log_path,
        rotation="00:00",
        retention="14 days",
        compression="tar.gz",
        serialize=True,
        filter=lambda record: record["extra"].get("type") != "api",
        level="INFO"
    )

