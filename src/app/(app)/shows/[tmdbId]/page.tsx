import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrFetchShow } from '@/lib/tmdb/cache'
import { TMDB_IMAGE_BASE } from '@/lib/tmdb/client'
import { ReviewCard } from '@/components/ReviewCard'
import { ShowInteractionPanel } from '@/components/ShowInteractionPanel'
import { StarDisplay } from '@/components/StarRating'
import { Badge } from '@/components/ui/badge'
import { ShowInteraction, Profile, Show } from '@/types/database'
import { Calendar, Tv } from 'lucide-react'

type ReviewWithProfile = ShowInteraction & {
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tmdbId: string }>
}) {
  const { tmdbId } = await params
  return { title: `Show — StoryTime` }
}

export default async function ShowDetailPage({
  params,
}: {
  params: Promise<{ tmdbId: string }>
}) {
  const { tmdbId: tmdbIdStr } = await params
  const tmdbId = parseInt(tmdbIdStr, 10)
  if (isNaN(tmdbId)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch/cache show data
  const show = await getOrFetchShow(tmdbId, supabase)
  if (!show) notFound()

  // Run queries in parallel
  const [userInteractionResult, friendReviewsResult, communityRatingResult] =
    await Promise.all([
      user
        ? supabase
            .from('show_interactions')
            .select('*')
            .eq('show_id', tmdbId)
            .eq('user_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),

      user
        ? supabase
            .from('show_interactions')
            .select('*, profiles(id, username, avatar_url)')
            .eq('show_id', tmdbId)
            .not('review_body', 'is', null)
            .neq('user_id', user.id)
            .limit(20)
        : Promise.resolve({ data: [] }),

      supabase
        .from('show_interactions')
        .select('rating')
        .eq('show_id', tmdbId)
        .not('rating', 'is', null),
    ])

  const userInteraction = userInteractionResult.data as ShowInteraction | null
  const friendReviews = (friendReviewsResult.data ?? []) as ReviewWithProfile[]
  const allRatings = (communityRatingResult.data ?? []) as { rating: number | null }[]
  const communityAvg =
    allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + (r.rating ?? 0), 0) / allRatings.length
      : null

  const genres = Array.isArray(show.genres)
    ? (show.genres as Array<{ id: number; name: string }>)
    : []
  const year = show.first_air_date?.slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Backdrop */}
      {show.backdrop_path && (
        <div className="relative -mx-4 h-48 sm:h-64 overflow-hidden rounded-lg">
          <Image
            src={`${TMDB_IMAGE_BASE}/w1280${show.backdrop_path}`}
            alt={show.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8">
        {/* Poster + interaction panel */}
        <div className="space-y-4">
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted w-full max-w-[200px]">
            {show.poster_path ? (
              <Image
                src={`${TMDB_IMAGE_BASE}/w342${show.poster_path}`}
                alt={show.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm text-center p-2">
                {show.name}
              </div>
            )}
          </div>

          {user && (
            <ShowInteractionPanel
              showId={tmdbId}
              initialInteraction={userInteraction}
            />
          )}
        </div>

        {/* Show info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{show.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {year}
                </span>
              )}
              {show.number_of_seasons && (
                <span className="flex items-center gap-1">
                  <Tv className="h-3.5 w-3.5" />
                  {show.number_of_seasons} season{show.number_of_seasons > 1 ? 's' : ''}
                </span>
              )}
              {show.status && <Badge variant="outline">{show.status}</Badge>}
            </div>
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => (
                  <Badge key={g.id} variant="secondary">
                    {g.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {communityAvg !== null && (
            <div className="flex items-center gap-2">
              <StarDisplay value={communityAvg} size="md" />
              <span className="text-sm text-muted-foreground">
                {communityAvg.toFixed(1)} · {allRatings.length} rating{allRatings.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {show.overview && (
            <p className="text-muted-foreground leading-relaxed">{show.overview}</p>
          )}

          {/* Seasons */}
          {show.number_of_seasons && show.number_of_seasons > 0 && (
            <div className="space-y-2">
              <h2 className="font-semibold">Seasons</h2>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: show.number_of_seasons }, (_, i) => i + 1).map((n) => (
                  <Link
                    key={n}
                    href={`/shows/${tmdbId}/season/${n}`}
                    className="px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                  >
                    Season {n}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {friendReviews.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Reviews</h2>
          <div className="grid gap-4">
            {friendReviews.map((review) => (
              <ReviewCard
                key={review.id}
                username={review.profiles.username}
                avatarUrl={review.profiles.avatar_url}
                rating={review.rating}
                reviewBody={review.review_body!}
                containsSpoilers={review.review_contains_spoilers}
                updatedAt={review.updated_at}
                currentUserId={user?.id}
                reviewUserId={review.user_id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
