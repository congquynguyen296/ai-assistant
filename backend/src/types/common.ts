export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface RestResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  error?: unknown;
}

export interface DocumentRefDto {
  _id: string;
  title?: string;
  fileName?: string;
  fileUrl?: string | null;
}

export type DocumentRef = string | DocumentRefDto;
