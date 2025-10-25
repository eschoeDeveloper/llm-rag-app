export async function postText(url: string, body: unknown, signal?: AbortSignal): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
  return text;
}

export async function postJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message || `HTTP ${res.status}`);
  return data as T;
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message || `HTTP ${res.status}`);
  return data as T;
}

export async function putJson<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message || `HTTP ${res.status}`);
  return data as T;
}

export async function deleteJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error((data as any)?.message || `HTTP ${res.status}`);
  return data as T;
}