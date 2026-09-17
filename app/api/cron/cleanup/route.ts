import { type NextRequest, NextResponse } from 'next/server'
import { getAppointmentById, deleteAppointment } from '@/lib/medirecords/appointments'
import { redis } from '@/lib/redis'
import { logger } from '@/lib/logger'

// Vercel Cron: runs every 20 minutes to release expired slot locks
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/cleanup", "schedule": "*/20 * * * *" }] }
export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!redis) return NextResponse.json({ cleaned: 0 })
  const r = redis // narrowed — safe to use inside callbacks

  // Only delete appointments we created — tracked in the slot-locks sorted set.
  // Score = creation timestamp (ms). Cutoff = 35 min ago, giving the
  // checkout.session.expired webhook (fires at 30 min) time to run first.
  const cutoff = Date.now() - 35 * 60 * 1000
  const ids = await r.zrange<string[]>('slot-locks', 0, cutoff, { byScore: true })

  await Promise.allSettled(
    ids.map(async id => {
      const appointment = await getAppointmentById(id)
      if (appointment.appointmentStatus !== 2) {
        // Already confirmed or cancelled — stale Redis entry, just clean up
        await r.zrem('slot-locks', id)
        return
      }
      await deleteAppointment(id)
      await r.zrem('slot-locks', id)
      await logger.log({ event: 'booking.expired_lock_released', appointmentId: id })
    }),
  )

  return NextResponse.json({ cleaned: ids.length })
}
