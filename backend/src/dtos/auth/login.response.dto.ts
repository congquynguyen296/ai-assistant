import type { UserPublicDto } from "@/types/entity.js";

export interface LoginResponseDto {
  user: UserPublicDto;
  token: string;
}
