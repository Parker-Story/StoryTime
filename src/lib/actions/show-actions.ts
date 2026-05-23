'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { WatchStatus } from '@/types/database'

interface ShowInteractionData {
  watchStatus?: WatchStatus | null
  rating?: number | null
  reviewBody?: string | null
  reviewContainsSpoilers?: boolean
}

export async function upsertShowInteraction(
  showId: number,
  data: ShowInteractionData
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('show_interactions').upsert(
    {
      user_id: user.id,
      show_id: showId,
      watch_status: data.watchStatus ?? null,
      rating: data.rating ?? null,
      review_body: data.reviewBody ?? null,
      review_contains_spoilers: data.reviewContainsSpoilers ?? false,
      updated_at: new Date().toISOString(),
    } as never,
    { onConflict: 'user_id,show_id' }
  )

  if (error) return { error: error.message }

  revalidatePath(`/shows/${showId}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteShowInteraction(showId: number) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('show_interactions')
    .delete()
    .eq('user_id', user.id)
    .eq('show_id', showId)

  if (error) return { error: error.message }

  revalidatePath(`/shows/${showId}`)
  revalidatePath('/dashboard')
  return { error: null }
}
