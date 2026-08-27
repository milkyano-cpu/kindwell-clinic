import { type NextRequest, NextResponse } from 'next/server'
import { type ZodTypeAny } from 'zod'
import { MediRecordsError } from '@/lib/medirecords/client'
import { checkRateLimit } from './rate-limit'

type LimiterKey = 'default' | 'booking' | 'payment'

interface ACLOptions<T> {
  schema?: ZodTypeAny & { _output: T }
  rateLimit?: LimiterKey
}

export function withACL<T = unknown>(
  handler: (req: NextRequest, body: T) => Promise<NextResponse>,
  options: ACLOptions<T> = {},
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    if (options.rateLimit) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
      const allowed = await checkRateLimit(ip, options.rateLimit)
      if (!allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      }
    }

    let body = {} as T
    if (options.schema) {
      try {
        const raw = await req.json()
        const result = options.schema.safeParse(raw)
        if (!result.success) {
          return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
        }
        body = result.data
      } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
      }
    }

    try {
      return await handler(req, body)
    } catch (err) {
      if (err instanceof MediRecordsError) {
        const status = err.status >= 500 ? 502 : err.status
        return NextResponse.json({ error: 'Booking service error', detail: err.body }, { status })
      }
      console.error('[API Error]', err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
