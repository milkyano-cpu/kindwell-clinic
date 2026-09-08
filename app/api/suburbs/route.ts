import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const DATASET_URL =
  'https://raw.githubusercontent.com/matthewproctor/australianpostcodes/master/australian_postcodes.csv'

const CACHE_KEY = 'suburbs:lookup'
const CACHE_TTL = 86400 // 24h

type Lookup = Record<string, string[]>

async function buildLookup(): Promise<Lookup> {
  const res = await fetch(DATASET_URL)
  if (!res.ok) throw new Error('Failed to fetch postcode dataset')
  const csv = await res.text()

  const lookup: Lookup = {}
  const lines = csv.split('\n')
  // header: id,postcode,locality,state,long,lat,dc,type,status
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 5) continue
    const postcode = cols[1]?.trim()
    const locality = cols[2]?.trim()
    const type = cols[7]?.trim()
    // Only delivery area localities — excludes PO boxes, LVRs, DCs
    if (!postcode || !locality || type !== 'Delivery Area') continue
    if (!lookup[postcode]) lookup[postcode] = []
    if (!lookup[postcode].includes(locality)) lookup[postcode].push(locality)
  }
  return lookup
}

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get('postcode')
  if (!postcode || !/^\d{4}$/.test(postcode)) {
    return NextResponse.json({ suburbs: [] })
  }

  try {
    let lookup: Lookup | null = null

    if (redis) {
      lookup = await redis.get<Lookup>(CACHE_KEY)
    }

    if (!lookup) {
      lookup = await buildLookup()
      if (redis) {
        await redis.set(CACHE_KEY, lookup, { ex: CACHE_TTL })
      }
    }

    const suburbs = lookup[postcode] ?? []
    return NextResponse.json({ suburbs: suburbs.sort() })
  } catch {
    return NextResponse.json({ suburbs: [] })
  }
}
