import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUserStats } from '@/lib/stats'
import { ReviewCard } from '@/components/ReviewCard'
import { ShowCard } from '@/components/ShowCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AddFriendButton } from '@/components/AddFriendButton'
import { Profile, ShowInteraction, Show } from '@/types/database'
import { Calendar } from 'lucide-react'

type InteractionWithShow = ShowInteraction & {
  shows: Pick<Show, 'tmdb_id' | 'name' | 'poster_path' | 'first_air_date'>
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!profile) notFound()

  const typedProfile = profile as Profile

  const [stats, reviews, interactions, friendshipResult] = await Promise.all([
    getUserStats(typedProfile.id, supabase),

    supabase
      .from('show_interactions')
      .select('*, shows(tmdb_id, name, poster_path, first_air_date)')
      .eq('user_id', typedProfile.id)
      .not('review_body', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(10),

    supabase
      .from('show_interactions')
      .select('*, shows(tmdb_id, name, poster_path, first_air_date)')
      .eq('user_id', typedProfile.id)
      .not('watch_status', 'is', null)
      .order('updated_at', { ascending: false }),

    currentUser && currentUser.id !== typedProfile.id
      ? supabase
          .from('friendships')
          .select('id, status, requester_id')
          .or(
            `and(requester_id.eq.${currentUser.id},addressee_id.eq.${typedProfile.id}),and(requester_id.eq.${typedProfile.id},addressee_id.eq.${currentUser.id})`
          )
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const typedReviews = (reviews.data ?? []) as InteractionWithShow[]
  const typedInteractions = (interactions.data ?? []) as InteractionWithShow[]
  const friendship = friendshipResult.data as { id: string; status: string; requester_id: string } | null

  const byStatus = {
    watching: typedInteractions.filter((i) => i.watch_status === 'watching'),
    finished: typedInteractions.filter((i) => i.watch_status === 'finished'),
    want_to_watch: typedInteractions.filter((i) => i.watch_status === 'want_to_watch'),
    dropped: typedInteractions.filter((i) => i.watch_status === 'dropped'),
  }

  const joinDate = new Date(typedProfile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="max-w-3xl space-y-8">
      {/* Profile header */}
      <div className="flex items-start gap-5">
        <Avatar size="lg">
          <AvatarImage src={typedProfile.avatar_url ?? undefined} alt={typedProfile.username} />
          <AvatarFallback className="text-lg">
            {typedProfile.username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{typedProfile.username}</h1>
            {currentUser && currentUser.id !== typedProfile.id && (
              <AddFriendButton
                targetUserId={typedProfile.id}
                friendship={friendship ? { id: friendship.id, status: friendship.status, isRequester: friendship.requester_id === currentUser.id } : null}
              />
            )}
          </div>
          {typedProfile.bio && (
            <p className="text-muted-foreground text-sm">{typedProfile.bio}</p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            Joined {joinDate}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Shows Finished', value: stats.showsFinished },
          { label: 'Episodes', value: stats.episodesWatched },
          { label: 'Reviews', value: stats.totalReviews },
          {
            label: 'Avg Rating',
            value: stats.averageRating !== null ? `${stats.averageRating.toFixed(1)} ★` : '—',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-3 text-center"
          >
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="watching">Watching ({byStatus.watching.length})</TabsTrigger>
          <TabsTrigger value="finished">Finished ({byStatus.finished.length})</TabsTrigger>
          <TabsTrigger value="want">Want to Watch</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-3 mt-4">
          {typedReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            typedReviews.map((r) => (
              <div key={r.id}>
                <Link href={`/shows/${r.show_id}`} className="text-sm font-medium hover:underline mb-1 block">
                  {r.shows.name}
                </Link>
                <ReviewCard
                  username={typedProfile.username}
                  avatarUrl={typedProfile.avatar_url}
                  rating={r.rating}
                  reviewBody={r.review_body!}
                  containsSpoilers={r.review_contains_spoilers}
                  updatedAt={r.updated_at}
                  currentUserId={currentUser?.id}
                  reviewUserId={r.user_id}
                />
              </div>
            ))
          )}
        </TabsContent>

        {(['watching', 'finished', 'want_to_watch'] as const).map((status, idx) => (
          <TabsContent key={status} value={['watching', 'finished', 'want'][idx]} className="mt-4">
            {byStatus[status].length === 0 ? (
              <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {byStatus[status].map((i) => (
                  <ShowCard
                    key={i.show_id}
                    tmdbId={i.shows.tmdb_id}
                    name={i.shows.name}
                    posterPath={i.shows.poster_path}
                    watchStatus={i.watch_status}
                    rating={i.rating}
                    year={i.shows.first_air_date?.slice(0, 4)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
