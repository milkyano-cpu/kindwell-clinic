import { type NextRequest, NextResponse } from 'next/server'
import { getAppointments, deleteAppointment } from '@/lib/medirecords/appointments'
import { logger } from '@/lib/logger'

// Vercel Cron: runs every 20 minutes to release expired slot locks
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/cleanup", "schedule": "*/20 * * * *" }] }
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const cutoff = new Date(now.getTime() - 20 * 60 * 1000) // 20 min ago
  const today = now.toISOString().slice(0, 10)

  // Fetch all "Booked" (status=2) appointments for today
  const stale = await getAppointments({
    appointmentDateRangeStart: `${today}T00:00`,
    appointmentDateRangeEnd: `${today}T23:59`,
    appointmentStatus: 2,
  })

  const expired = stale.filter(
    a => new Date(a.createdDateTime) < cutoff,
  )

  await Promise.allSettled(
    expired.map(async a => {
      await deleteAppointment(a.id)
      await logger.log({ event: 'booking.expired_lock_released', appointmentId: a.id })
    }),
  )

  return NextResponse.json({ cleaned: expired.length })
}
