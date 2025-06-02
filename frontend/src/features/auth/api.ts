import type { UserResponse, TokenResponse } from "./types";

export const BASE = '/api/auth';

// Registers a new user
export async function registerUser(email: string, password: string): Promise<UserResponse> {
  const res = await fetch(`${BASE}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`registerUser failed: ${res.status} ${res.statusText}`);
  return res.json();
}

// Logs in an existing user
export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${BASE}/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`loginUser failed: ${res.status} ${res.statusText}`);
  return res.json();
}

// Refreshes the access token using the refresh token
export async function refreshToken(refresh: TokenResponse['refresh']): Promise<TokenResponse['access']> {
  const res = await fetch(`${BASE}/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) throw new Error(`refreshToken failed: ${res.status} ${res.statusText}`);
  const { access } = (await res.json()) as { access: string };
  return access;
}

