import { type NextRequest, NextResponse } from 'next/server'
import { findPatientIdByEmail, findPatientIdByMobile } from '@/lib/medirecords/patients'
import { hasCompletedAppointment } from '@/lib/medirecords/appointments'
import { checkRateLimit } from '@/lib/acl/rate-limit'
import { MediRecordsError } from '@/lib/medirecords/client'

const VALID_SERVICES = ['alternative-medicine', 'smoking-cessation'] as const
type ServiceType = typeof VALID_SERVICES[number]

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous'
  const allowed = await checkRateLimit(ip, 'default')
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const mobile = req.nextUrl.searchParams.get('mobile')?.trim().replace(/\s/g, '')
  const email = req.nextUrl.searchParams.get('email')?.trim()
  const service = req.nextUrl.searchParams.get('service') as ServiceType | null

  if (!mobile && !email) return NextResponse.json({ error: 'mobile or email required' }, { status: 400 })
  if (!service || !VALID_SERVICES.includes(service))
    return NextResponse.json({ error: 'valid service required' }, { status: 400 })
  if (mobile && !/^04\d{8}$/.test(mobile))
    return NextResponse.json({ error: 'Invalid mobile format' }, { status: 400 })
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })

  try {
    const patientId =
      (mobile ? await findPatientIdByMobile(mobile).catch(() => null) : null) ??
      (email ? await findPatientIdByEmail(email).catch(() => null) : null)
    if (!patientId) {
      return NextResponse.json({ visitType: 'initial' })
    }
    const isReturning = await hasCompletedAppointment(patientId, service)
    return NextResponse.json({ visitType: isReturning ? 'follow-up' : 'initial' })
  } catch (err) {
    if (err instanceof MediRecordsError) {
      console.error('[patient-status] MediRecords error', { status: err.status, body: err.body })
      return NextResponse.json({ error: 'Unable to check status. Please try again.' }, { status: 502 })
    }
    console.error('[patient-status] error', err)
    return NextResponse.json({ error: 'A system error occurred.' }, { status: 500 })
  }
}
