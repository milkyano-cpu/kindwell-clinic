import { type NextRequest, NextResponse } from 'next/server'
import { withACL } from '@/lib/acl/with-acl'
import { deleteAppointment } from '@/lib/medirecords/appointments'
import { logger } from '@/lib/logger'

export const DELETE = withACL(
  async (req: NextRequest) => {
    const appointmentId = req.nextUrl.pathname.split('/').pop()!

    if (!/^[0-9a-f-]{36}$/.test(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 })
    }

    await deleteAppointment(appointmentId)

    await logger.log({
      event: 'booking.slot_released',
      appointmentId,
    })

    return NextResponse.json({ message: 'Slot released' })
  },
  { rateLimit: 'booking' },
)
