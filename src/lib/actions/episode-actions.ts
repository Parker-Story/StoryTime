'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markEpisodeWatched(
  showId: number,
  seasonNumber: number,
  episodeNumber: number
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('episode_watches').upsert(
    {
      user_id: user.id,
      show_id: showId,
      season_number: seasonNumber,
      episode_number: episodeNumber,
      watched_at: new Date().toISOString(),
    } as never,
    { onConflict: 'user_id,show_id,season_number,episode_number' }
  )

  if (error) return { error: error.message }
  revalidatePath(`/shows/${showId}/season/${seasonNumber}`)
  return { error: null }
}

export async function unmarkEpisodeWatched(
  showId: number,
  seasonNumber: number,
  episodeNumber: number
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('episode_watches')
    .delete()
    .eq('user_id', user.id)
    .eq('show_id', showId)
    .eq('season_number', seasonNumber)
    .eq('episode_number', episodeNumber)

  if (error) return { error: error.message }
  revalidatePath(`/shows/${showId}/season/${seasonNumber}`)
  return { error: null }
}

export async function updateEpisodeWatch(
  showId: number,
  seasonNumber: number,
  episodeNumber: number,
  data: { rating?: number | null; notes?: string | null }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('episode_watches')
    .update({ rating: data.rating ?? null, notes: data.notes ?? null } as never)
    .eq('user_id', user.id)
    .eq('show_id', showId)
    .eq('season_number', seasonNumber)
    .eq('episode_number', episodeNumber)

  if (error) return { error: error.message }
  revalidatePath(`/shows/${showId}/season/${seasonNumber}`)
  return { error: null }
}
