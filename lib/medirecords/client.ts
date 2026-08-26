const BASE_URL = process.env.MEDIRECORDS_BASE_URL!
const CLIENT_ID = process.env.MEDIRECORDS_CLIENT_ID!
const CLIENT_SECRET = process.env.MEDIRECORDS_CLIENT_SECRET!
const TOKEN_URL = process.env.MEDIRECORDS_TOKEN_URL ?? `${BASE_URL}/oauth/token`

export class MediRecordsError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`MediRecords API error ${status}`)
    this.name = 'MediRecordsError'
  }
}

// Module-level token cache — valid within a single serverless instance lifetime
let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new MediRecordsError(res.status, body)
  }

  const data: { access_token: string; expires_in: number } = await res.json()
  cachedToken = data.access_token
  // Refresh 60s before actual expiry
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000
  return cachedToken
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
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
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
