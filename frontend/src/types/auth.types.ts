import type { User } from "@/types/models";

export interface AuthSession {
  user: User;
  token: string;
}

export interface AuthProfileUpdate {
  username?: string;
  profileImage?: string;
}
