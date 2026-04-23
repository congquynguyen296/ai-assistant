export interface DocumentResponseDto {
  _id: string;
  userId: string;
  title: string;
  fileName: string;
  filePath: string;
  fileUrl?: string | null;
  mimeType?: string;
  fileSize: number;
  extractedText?: string;
  status?: "processing" | "ready" | "failed";
  uploadDate?: Date;
  lastAccessed?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  flashcardCount?: number;
  quizCount?: number;
}

export interface DocumentListResponseDto {
  documents: DocumentResponseDto[];
  count: number;
}
