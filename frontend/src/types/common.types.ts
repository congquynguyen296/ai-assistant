export type Nullable<T> = T | null;

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  error?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  field: string | null;
}

export interface GeneratePayload {
  count: number;
  title: string;
  requirements: string;
}
