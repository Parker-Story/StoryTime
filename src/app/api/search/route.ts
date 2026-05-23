import { NextRequest, NextResponse } from 'next/server'
import { searchShows } from '@/lib/tmdb/client'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10)

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [], total_pages: 0 })
  }

  try {
    const data = await searchShows(q, page)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
