const BASE_URL = process.env.MEDIRECORDS_BASE_URL ?? ''
const API_TOKEN = process.env.MEDIRECORDS_API_TOKEN ?? ''

export class MediRecordsError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`MediRecords API error ${status}`)
    this.name = 'MediRecordsError'
  }
}

async function request<T>(path: string, options?: RequestInit, baseUrl?: string): Promise<T> {
  const res = await fetch(`${baseUrl ?? BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new MediRecordsError(res.status, body)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

export const mrClient = {
  get: <T>(path: string, opts?: { baseUrl?: string }) =>
    request<T>(path, undefined, opts?.baseUrl),
  post: <T>(path: string, body: unknown, opts?: { baseUrl?: string }) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }, opts?.baseUrl),
  put: <T>(path: string, body: unknown, opts?: { baseUrl?: string }) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, opts?.baseUrl),
  delete: <T>(path: string, opts?: { baseUrl?: string }) =>
    request<T>(path, { method: 'DELETE' }, opts?.baseUrl),
}
