class TransientError(Exception):
    """Lỗi tạm thời: rate limit 429, timeout mạng..."""

class PermanentError(Exception):
    """Lỗi vĩnh viễn: text rỗng, dữ liệu hỏng, file quá lớn, hết quota OCR..."""
