import type { CrashDump } from '../types/crashDump';

export const BASE = '/api/dumps';

// Retrieve a list of crash dumps from the DRF backend
export async function fetchDumps(): Promise<CrashDump[]> {
    const res = await fetch(`${BASE}/`);
    if (!res.ok) throw new Error(`fetchDumps failed: ${res.status} ${res.statusText}`);
    return res.json();
}

// Retrieve a crash dump file by id and download it to local machine
export async function downloadDump(id: number, name: string): Promise<void> {
    const res = await fetch(`${BASE}/${id}/download/`);
    if (!res.ok) throw new Error(`downloadDump failed: ${res.status} ${res.statusText}`);

    // Read response as a blob and create temporary object URL
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Create a link, click it, then clean up
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

