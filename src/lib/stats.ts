import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

export interface UserStats {
  showsFinished: number
  episodesWatched: number
  averageRating: number | null
  totalReviews: number
}

export async function getUserStats(
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<UserStats> {
  const [finishedResult, episodesResult, ratingsResult, reviewsResult] =
    await Promise.all([
      supabase
        .from('show_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('watch_status', 'finished'),

      supabase
        .from('episode_watches')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId),

      supabase
        .from('show_interactions')
        .select('rating')
        .eq('user_id', userId)
        .not('rating', 'is', null),

      supabase
        .from('show_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('review_body', 'is', null),
    ])

  const ratings = (ratingsResult.data ?? []).map((r) => (r as { rating: number | null }).rating as number)
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : null

  return {
    showsFinished: finishedResult.count ?? 0,
    episodesWatched: episodesResult.count ?? 0,
    averageRating,
    totalReviews: reviewsResult.count ?? 0,
  }
}
