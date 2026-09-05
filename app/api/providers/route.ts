import { NextResponse } from 'next/server'
import { withACL } from '@/lib/acl/with-acl'
import { getProviders } from '@/lib/medirecords/providers'

export const GET = withACL(
  async () => {
    const providers = await getProviders()
    return NextResponse.json({ providers })
  },
  { rateLimit: 'default' },
)
