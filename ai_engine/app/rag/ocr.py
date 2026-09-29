import io
import os
import time
import logging
from typing import List, Tuple, Dict, Any

from pypdf import PdfReader
from azure.core.credentials import AzureKeyCredential
from azure.ai.documentintelligence import DocumentIntelligenceClient
from azure.core.exceptions import HttpResponseError

from errors import TransientError, PermanentError

logger = logging.getLogger(__name__)

# Config from env
DOCINTEL_ENDPOINT = os.getenv("DOCINTEL_ENDPOINT")
DOCINTEL_KEY = os.getenv("DOCINTEL_KEY")
OCR_BATCH_PAGES = int(os.getenv("OCR_BATCH_PAGES", "2"))
OCR_MAX_PAGES = int(os.getenv("OCR_MAX_PAGES", "30"))
OCR_MIN_CHARS_PER_PAGE = int(os.getenv("OCR_MIN_CHARS_PER_PAGE", "200"))

def get_docintel_client():
    if not DOCINTEL_ENDPOINT or not DOCINTEL_KEY:
        raise PermanentError("DOCINTEL_ENDPOINT and DOCINTEL_KEY must be set for OCR")
    return DocumentIntelligenceClient(endpoint=DOCINTEL_ENDPOINT, credential=AzureKeyCredential(DOCINTEL_KEY))

def split_pages(pdf_bytes: bytes) -> Tuple[List[str], List[int]]:
    """
    Returns:
        page_texts: List of strings (one per page).
        ocr_pages: List of 1-indexed page numbers that need OCR.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
    except Exception as e:
        raise PermanentError(f"Failed to read PDF: {e}")
        
    page_texts = []
    ocr_pages = []
    
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        page_texts.append(text)
        # Check if page needs OCR
        if len(text.strip()) < OCR_MIN_CHARS_PER_PAGE:
            ocr_pages.append(i + 1) # 1-indexed for Azure
            
    return page_texts, ocr_pages

def ocr_pages_batch(client, pdf_bytes: bytes, pages: str) -> Dict[int, str]:
    """OCR a specific batch of pages. Returns dict mapping 1-indexed page number to text."""
    try:
        poller = client.begin_analyze_document(
            model_id="prebuilt-read",
            body=pdf_bytes,
            pages=pages,
            content_type="application/pdf"
        )
        result = poller.result()
    except HttpResponseError as e:
        if e.status_code in [429, 500, 502, 503, 504]:
            raise TransientError(f"Azure OCR Transient Error {e.status_code}: {e.message}")
        else:
            raise PermanentError(f"Azure OCR Permanent Error {e.status_code}: {e.message}")
    except Exception as e:
        raise PermanentError(f"Azure OCR Unexpected Error: {e}")
        
    extracted = {}
    if not hasattr(result, "pages") or not result.pages:
        raise PermanentError(f"Azure OCR returned no pages for batch {pages}")
        
    for page in result.pages:
        # Azure returns page_number 1-indexed based on original document
        page_num = page.page_number
        lines = [line.content for line in page.lines] if page.lines else []
        extracted[page_num] = "\n".join(lines)
        
    return extracted

def extract_pdf_text(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Returns:
        {
            "text": str,
            "pageCount": int,
            "ocrUsed": bool,
            "ocrPages": int
        }
    """
    page_texts, ocr_pages = split_pages(pdf_bytes)
    page_count = len(page_texts)
    
    if len(ocr_pages) > OCR_MAX_PAGES:
        raise PermanentError(f"Too many pages require OCR ({len(ocr_pages)} > {OCR_MAX_PAGES})")
        
    if not ocr_pages:
        return {
            "text": "\n\n".join(page_texts),
            "pageCount": page_count,
            "ocrUsed": False,
            "ocrPages": 0
        }
        
    client = get_docintel_client()
    
    # Process in batches
    for i in range(0, len(ocr_pages), OCR_BATCH_PAGES):
        batch = ocr_pages[i:i + OCR_BATCH_PAGES]
        pages_str = ",".join(map(str, batch))
        logger.info(f"Running OCR on pages: {pages_str}")
        
        batch_results = ocr_pages_batch(client, pdf_bytes, pages_str)
        
        # Merge results
        for page_num in batch:
            if page_num not in batch_results:
                raise PermanentError(f"Azure OCR failed to return text for page {page_num}")
            # Replace the empty/bad text with OCR text (page_num is 1-indexed)
            page_texts[page_num - 1] = batch_results[page_num]
            
        if i + OCR_BATCH_PAGES < len(ocr_pages):
            # Sleep to respect F0 tier rate limit (1 req/sec)
            time.sleep(1.2)
            
    final_text = "\n\n".join(page_texts)
    
    # Check max size (5MB)
    if len(final_text.encode('utf-8')) > 5 * 1024 * 1024:
        raise PermanentError("Extracted text exceeds 5MB limit")
        
    return {
        "text": final_text,
        "pageCount": page_count,
        "ocrUsed": True,
        "ocrPages": len(ocr_pages)
    }
