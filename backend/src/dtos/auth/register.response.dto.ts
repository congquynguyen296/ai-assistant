import type { UserPublicDto } from "@/types/entity.js";

export interface RegisterResponseDto {
  message: string;
  email: string;
}

export interface ConfirmEmailResponseDto {
  user: UserPublicDto;
  token: string;
}
