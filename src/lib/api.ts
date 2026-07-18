const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Use relative paths for /api/* routes to go through the local proxy (avoids CORS)
  const url = path.startsWith('/api/') ? path : `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
