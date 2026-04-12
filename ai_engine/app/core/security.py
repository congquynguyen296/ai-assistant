"""
ai_engine/app/core/security.py
FastAPI dependency — validates the X-Internal-API-Key header.
Node.js backend sends this key on every request so that the Python
service cannot be called by arbitrary external clients.
"""
from fastapi import Header, HTTPException, status
from .config import INTERNAL_API_KEY


async def verify_internal_key(
    x_internal_api_key: str = Header(..., alias="X-Internal-API-Key"),
) -> None:
    """Raise HTTP 401 if the caller does not supply the correct internal key."""
    if not INTERNAL_API_KEY:
        # If the key is not configured (e.g. local dev without .env), skip check.
        return
    if x_internal_api_key != INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid internal API key.",
        )
