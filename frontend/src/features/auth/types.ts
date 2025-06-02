export interface UserResponse {
  id: number;
  email: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}