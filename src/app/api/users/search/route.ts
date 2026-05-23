import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()

  if (!q || q.length < 1) {
    return NextResponse.json({ users: [] })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .ilike('username', `%${q}%`)
    .limit(10)

  if (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }

  return NextResponse.json({ users: data ?? [] })
}
