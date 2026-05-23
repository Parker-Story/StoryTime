import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTrendingShows } from '@/lib/tmdb/client'
import { ShowCard } from '@/components/ShowCard'
import { FriendActivityFeed } from '@/components/FriendActivityFeed'
import { ShowInteraction, Show, Profile } from '@/types/database'

export const metadata = { title: 'Dashboard — StoryTime' }

type InteractionWithShow = ShowInteraction & {
  shows: Pick<Show, 'tmdb_id' | 'name' | 'poster_path' | 'first_air_date'>
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [trendingResult, friendActivityResult, continueWatchingResult] =
    await Promise.allSettled([
      getTrendingShows(),

      supabase
        .from('show_interactions')
        .select('*, profiles!show_interactions_user_id_fkey(id, username, avatar_url), shows(tmdb_id, name, poster_path)')
        .in(
          'user_id',
          // Get friend IDs via subquery — use RPC or join via friendships_normalized view
          // Simplified: fetch friend IDs first
          (await supabase
            .from('friendships')
            .select('requester_id, addressee_id')
            .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
            .eq('status', 'accepted')
          ).data?.flatMap((f: { requester_id: string; addressee_id: string }) =>
            f.requester_id === user.id ? [f.addressee_id] : [f.requester_id]
          ) ?? []
        )
        .order('updated_at', { ascending: false })
        .limit(20),

      supabase
        .from('show_interactions')
        .select('*, shows(tmdb_id, name, poster_path, first_air_date)')
        .eq('user_id', user.id)
        .eq('watch_status', 'watching')
        .order('updated_at', { ascending: false })
        .limit(6),
    ])

  const trending =
    trendingResult.status === 'fulfilled' ? trendingResult.value.results.slice(0, 10) : []
  const friendActivity =
    friendActivityResult.status === 'fulfilled'
      ? ((friendActivityResult.value.data ?? []) as InteractionWithShow[])
      : []
  const continueWatching =
    continueWatchingResult.status === 'fulfilled'
      ? ((continueWatchingResult.value.data ?? []) as InteractionWithShow[])
      : []

  const activities = friendActivity.map((item) => ({
    id: item.id,
    username: item.profiles.username,
    avatarUrl: item.profiles.avatar_url,
    showName: item.shows.name,
    showId: item.shows.tmdb_id,
    watchStatus: item.watch_status,
    rating: item.rating,
    reviewBody: item.review_body,
    updatedAt: item.updated_at,
  }))

  return (
    <div className="space-y-10">
      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Continue Watching</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {continueWatching.map((item) => (
              <ShowCard
                key={item.show_id}
                tmdbId={item.shows.tmdb_id}
                name={item.shows.name}
                posterPath={item.shows.poster_path}
                watchStatus={item.watch_status}
                rating={item.rating}
                year={item.shows.first_air_date?.slice(0, 4)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
        {/* Trending */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Popular Right Now</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {trending.map((show) => (
              <ShowCard
                key={show.id}
                tmdbId={show.id}
                name={show.name}
                posterPath={show.poster_path}
                year={show.first_air_date?.slice(0, 4)}
                communityRating={show.vote_average > 0 ? show.vote_average / 2 : null}
              />
            ))}
          </div>
          <Link href="/search" className="text-sm text-primary hover:underline">
            Browse all shows →
          </Link>
        </section>

        {/* Friend Activity */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Friend Activity</h2>
          <FriendActivityFeed activities={activities} />
          {activities.length === 0 && (
            <Link href="/friends" className="text-sm text-primary hover:underline">
              Find friends →
            </Link>
          )}
        </section>
      </div>
    </div>
  )
}
