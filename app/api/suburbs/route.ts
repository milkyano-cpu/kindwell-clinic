import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis'

const DATASET_URL =
  'https://raw.githubusercontent.com/matthewproctor/australianpostcodes/master/australian_postcodes.csv'

const CACHE_KEY = 'suburbs:lookup'
const CACHE_TTL = 86400 // 24h

type Lookup = Record<string, string[]>

const col = (s: string) => s?.trim().replace(/^"|"$/g, '') ?? ''

async function buildLookup(): Promise<Lookup> {
  const res = await fetch(DATASET_URL)
  if (!res.ok) throw new Error('Failed to fetch postcode dataset')
  const csv = await res.text()

  const lookup: Lookup = {}
  const lines = csv.split(/\r?\n/)
  // header: id,postcode,locality,state,...
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    if (cols.length < 4) continue
    const postcode = col(cols[1])
    const locality = col(cols[2])
    const state = col(cols[3])
    if (!postcode || !locality || !state) continue
    const key = `${postcode}:${state}`
    if (!lookup[key]) lookup[key] = []
    if (!lookup[key].includes(locality)) lookup[key].push(locality)
  }
  return lookup
}

export async function GET(req: NextRequest) {
  const postcode = req.nextUrl.searchParams.get('postcode')
  const state = req.nextUrl.searchParams.get('state')

  if (!postcode || !/^\d{4}$/.test(postcode) || !state) {
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

    const suburbs = lookup[`${postcode}:${state}`] ?? []
    return NextResponse.json({ suburbs: suburbs.sort() })
  } catch {
    return NextResponse.json({ suburbs: [] })
  }
}
