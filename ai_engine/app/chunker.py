"""
ai_engine/app/chunker.py
Split plain text into semantically-aware chunks with metadata.

Entry point: chunk_text(text, chunk_size, overlap, source_name) -> List[Chunk]
"""
from __future__ import annotations

import re
from typing import List

from .models import Chunk
from .core.config import DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP

# ── Section header patterns ───────────────────────────────────────────────────

_HEADER_PATTERNS: list[str] = [
    r"^\#{1,6}\s+.+",                            # Markdown: # Title
    r"^\d+\.\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝ].+",        # "1. Vietnamese Title"
    r"^[IVXLC]+\.\s+.+",                          # "IV. Roman numeral"
    r"^Chương\s+\d+",
    r"^Bài\s+\d+",
    r"^Phần\s+\d+",
    r"^[A-ZÀÁÂ][A-ZÀÁÂ\s]{4,}$",                 # ALL CAPS (min 5 chars)
]
_HEADER_RE = re.compile("|".join(_HEADER_PATTERNS))

# ── Chemical / science formula pattern ───────────────────────────────────────

_FORMULA_RE = re.compile(
    r"[A-Z][a-z]?\d*(?:[A-Z][a-z]?\d*)+"        # H2SO4, NaCl, C6H12O6
    r"|[A-Z][a-z]?\([A-Za-z0-9]+\)\d+"           # Ca(OH)2, Fe(NO3)3
    r"|\d+\s*[A-Z]\w*\s*[→=⇌]\s*\w+"            # equations with arrows
    r"|pH|mol\b|mmol|M\b|atm|kJ|kPa|eV"         # scientific units
)


def _is_section_header(line: str) -> bool:
    return bool(_HEADER_RE.match(line.strip()))


def _contains_formula(text: str) -> bool:
    return bool(_FORMULA_RE.search(text))


def _count_words(text: str) -> int:
    return len(text.split())


def _words_of(text: str) -> list[str]:
    return text.split()


def _make_chunk(
    parts: list[str],
    index: int,
    section: str,
    source: str,
) -> Chunk:
    content = "\n\n".join(parts)
    return Chunk(
        content=content,
        chunk_index=index,
        word_count=_count_words(content),
        has_chemistry=_contains_formula(content),
        section=section,
        source=source,
    )


# ── Text normalisation ────────────────────────────────────────────────────────

def _normalize(text: str) -> str:
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Collapse repeated spaces/tabs (but not newlines)
    text = re.sub(r"[^\S\n]+", " ", text)
    # Collapse 3+ blank lines to exactly 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ── Main chunker ──────────────────────────────────────────────────────────────

def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    overlap: int = DEFAULT_OVERLAP,
    source_name: str = "",
) -> List[Chunk]:
    """Split text into overlapping chunks with section & chemistry metadata.

    Algorithm:
    1. Normalize whitespace.
    2. Split into paragraphs on double-newlines.
    3. Accumulate paragraphs into a buffer; flush when buffer exceeds chunk_size.
    4. If a single paragraph exceeds chunk_size, split it on word boundaries.
    5. Overlap: carry the last `overlap` words of the previous chunk into the next.
    6. Fallback: if nothing produced, word-split the whole text.
    """
    if not text or not text.strip():
        return []

    text = _normalize(text)
    paragraphs = [p.strip() for p in re.split(r"\n\n+", text) if p.strip()]

    chunks: List[Chunk] = []
    buffer: list[str] = []
    buffer_wc: int = 0
    current_section: str = ""
    chunk_index: int = 0

    def flush(buf: list[str], sec: str) -> Chunk:
        nonlocal chunk_index
        c = _make_chunk(buf, chunk_index, sec, source_name)
        chunk_index += 1
        return c

    def make_overlap(prev_content: str) -> str:
        """Return the last `overlap` words of the previous chunk."""
        words = _words_of(prev_content)
        return " ".join(words[-overlap:]) if len(words) > overlap else prev_content

    for para in paragraphs:
        # Track section headers (don't flush on header alone)
        if _is_section_header(para):
            current_section = para

        para_wc = _count_words(para)

        # ── Paragraph larger than chunk_size → split individually ──────────
        if para_wc > chunk_size:
            # First flush any pending buffer
            if buffer:
                chunk = flush(buffer, current_section)
                chunks.append(chunk)
                overlap_text = make_overlap(chunk.content)
                buffer = [overlap_text]
                buffer_wc = _count_words(overlap_text)

            # Slide a window over the large paragraph
            words = _words_of(para)
            i = 0
            while i < len(words):
                end = min(i + chunk_size, len(words))
                segment_words = words[i:end]
                segment = " ".join(segment_words)
                c = _make_chunk([segment], chunk_index, current_section, source_name)
                chunk_index += 1
                chunks.append(c)
                if end >= len(words):
                    break
                i += chunk_size - overlap
            continue

        # ── Buffer overflow → flush then start new buffer with overlap ──────
        if buffer_wc + para_wc > chunk_size and buffer:
            chunk = flush(buffer, current_section)
            chunks.append(chunk)
            overlap_text = make_overlap(chunk.content)
            buffer = [overlap_text, para]
            buffer_wc = _count_words(overlap_text) + para_wc
        else:
            buffer.append(para)
            buffer_wc += para_wc

    # Flush remaining buffer
    if buffer:
        chunks.append(flush(buffer, current_section))

    # ── Fallback: word-split the whole text ───────────────────────────────────
    if not chunks:
        words = _words_of(text)
        i = 0
        while i < len(words):
            end = min(i + chunk_size, len(words))
            segment = " ".join(words[i:end])
            c = _make_chunk([segment], chunk_index, "", source_name)
            chunk_index += 1
            chunks.append(c)
            if end >= len(words):
                break
            i += chunk_size - overlap

    return chunks
