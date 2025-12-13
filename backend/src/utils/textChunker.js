/**
 * Split text into chunks for better AI processing
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Target size per chunk (in words)
 * @param {number} overlap - Number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean text while preserving paragraph structure
  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n/g, "\n")
    .trim();

  // Try to split by paragraphs (single or double newlines)
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // If single paragraph exceeds chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Split large paragraph into word-based chunks
      for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    // If adding this paragraph exceeds chunk size, save current chunk
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      // Add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex,
      pageNumber: 0,
    });
  }

  // Fallback: if no chunks created, split by words
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */
export const findRelevantChunksTest = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  // Common stop words to exclude
  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
  ]);

  // Extract and clean query words
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    // Return clean chunk objects without Mongoose metadata
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    // Score each query word
    for (const word of queryWords) {
      // Exact word match (higher score)
      const exactMatches = (
        content.match(new RegExp(`\\b${word}\\b`, "g")) || []
      ).length;
      score += exactMatches * 3;

      // Partial match (lower score)
      const partialMatches = (content.match(new RegExp(word, "g")) || [])
        .length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // Bonus: Multiple query words found
    const uniqueWordsFound = queryWords.filter((word) =>
      content.includes(word)
    ).length;
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    // Normalize by content length
    const normalizedScore = score / Math.sqrt(contentWords);

    // Small bonus for earlier chunks
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    // Return clean object without Mongoose metadata
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound,
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum chunks to return
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 15) => {
  // 1. Bảo vệ dữ liệu đầu vào
  if (!chunks || chunks.length === 0) return [];
  if (!query) return chunks.slice(0, 3); // Trả về đầu tài liệu nếu không hỏi gì

  // 2. CHIẾN THUẬT "ALL-IN" (Quan trọng):
  // Gemini 2.5 Flash có context window rất lớn (1 triệu token).
  // Nếu tổng độ dài tài liệu < 30,000 ký tự (khoảng 10-15 trang A4 full chữ),
  // Hãy gửi HẾT. Đừng tìm kiếm cắt gọt làm gì cho sai sót.
  const totalLength = chunks.reduce(
    (acc, chunk) => acc + chunk.content.length,
    0
  );
  if (totalLength < 30000) {
    console.log("Tài liệu ngắn, gửi toàn bộ context cho AI.");
    return chunks.map((c) => ({
      content: c.content,
      chunkIndex: c.chunkIndex,
      pageNumber: c.pageNumber,
      _id: c._id,
    }));
  }

  // 3. Xử lý tìm kiếm cho tài liệu DÀI (keyword scoring cải tiến cho Tiếng Việt)
  const queryLower = query.toLowerCase().trim();
  const queryTerms = queryLower.split(/\s+/).filter((w) => w.length > 1); // Bỏ từ quá ngắn 1 ký tự

  const scoredChunks = chunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    // Tính điểm:
    // +10 điểm nếu chứa nguyên cụm từ người dùng hỏi (Phrase match)
    if (contentLower.includes(queryLower)) {
      score += 10;
    }

    // +1 điểm cho mỗi từ khóa xuất hiện
    queryTerms.forEach((term) => {
      if (contentLower.includes(term)) {
        score += 1;
      }
    });

    return {
      ...chunk, // Giữ lại metadata
      content: chunk.content,
      score,
      // Điểm bonus nhỏ cho các chunk nằm đầu tài liệu (thường chứa thông tin giới thiệu)
      finalScore: score + 1 / (chunk.chunkIndex + 1),
    };
  });

  // 4. Sắp xếp và lấy kết quả
  // Lọc những chunk có score > 0 hoặc lấy top chunk nếu không tìm thấy gì
  let result = scoredChunks
    .sort((a, b) => b.finalScore - a.finalScore)
    .slice(0, maxChunks);

  // FALLBACK: Nếu tìm kiếm thất bại (không khớp từ nào),
  // vẫn trả về 5 chunk đầu tiên để AI không bị "mù".
  const hasMatch = result.some((r) => r.score > 0);
  if (!hasMatch) {
    console.log("Không khớp từ khóa, dùng Fallback chunks đầu tiên.");
    return chunks.slice(0, 5);
  }

  // 5. Luôn thêm Chunk số 0 (Chunk đầu tiên) vào nếu nó chưa có trong danh sách
  // Vì chunk đầu thường chứa Tiêu đề, Tác giả, Tóm tắt quan trọng.
  const hasFirstChunk = result.some((r) => r.chunkIndex === 0);
  if (!hasFirstChunk && chunks.length > 0) {
    result.push(chunks[0]);
  }

  // Sắp xếp lại theo thứ tự xuất hiện trong văn bản để AI đọc cho mượt
  return result.sort((a, b) => a.chunkIndex - b.chunkIndex);
};
