import { refreshToken } from '../auth/api';
import type { CrashDump } from './types';

export const BASE = '/api/dumps';

// Helper to attempt fetch with authentication
export async function withAuth(doFetch: (token: string | null) => Promise<Response>): Promise<Response> {
  let access = localStorage.getItem('accessToken');
  let res = await doFetch(access);

  if (res.status !== 401) {
    return res;
  }

  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) {
    console.log("NO REFRESH TOKEN");
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error("Not authenticated. Please log in.");
  }

  try {
    const newAccess = await refreshToken(refresh);
    console.log("ACCESS TOKEN REFRESHED");
    localStorage.setItem('accessToken', newAccess);
    access = newAccess;
  } catch (err) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error("Session expired. Please log in again.");
  }

  res = await doFetch(access);
  return res;
}

// Fetches all CrashDump objects from the server.
export async function fetchDumps(): Promise<CrashDump[]> {
  const res = await withAuth(token =>
    fetch(`${BASE}/`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  );

  if (!res.ok) throw new Error(`fetchDumps failed: ${res.status} ${res.statusText}`);
  return (await res.json()) as CrashDump[];
}

// Retrieves a crash dump file by id and download it to local machine
export async function downloadDump(id: number, name: string): Promise<void> {
  const res = await withAuth(token =>
    fetch(`${BASE}/${id}/download/`, {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  );
  if (!res.ok) throw new Error(`downloadDump failed: ${res.status} ${res.statusText}`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Deletes a crash dump by id
export async function deleteDump(id: number): Promise<void> {
  const res = await withAuth(token =>
    fetch(`${BASE}/${id}/`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  );
  if (!res.ok) throw new Error(`deleteDump failed: ${res.status} ${res.statusText}`);
}

