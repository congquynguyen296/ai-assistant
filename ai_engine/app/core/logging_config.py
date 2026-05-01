"""
ai_engine/app/core/logging_config.py
Configure logging for file + console outputs.
"""
from __future__ import annotations

import logging
import os
from logging.handlers import RotatingFileHandler

from .config import LOG_PATH


def setup_logging() -> None:
    log_dir = os.path.dirname(LOG_PATH)
    if log_dir:
        os.makedirs(log_dir, exist_ok=True)

    root = logging.getLogger()
    if root.handlers:
        return

    formatter = logging.Formatter("%(asctime)s %(levelname)s %(name)s — %(message)s")

    file_handler = RotatingFileHandler(
        LOG_PATH,
        maxBytes=5 * 1024 * 1024,
        backupCount=3,
        encoding="utf-8",
    )
    file_handler.setFormatter(formatter)

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)

    root.setLevel(logging.INFO)
    root.addHandler(file_handler)
    root.addHandler(console_handler)
