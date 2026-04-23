export interface ProfileResponseDto {
  id: string;
  username: string;
  email: string;
  profileImage?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
