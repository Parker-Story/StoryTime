import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOrFetchSeason } from '@/lib/tmdb/cache'
import { EpisodeRow } from '@/components/EpisodeRow'
import { EpisodeWatch } from '@/types/database'
import { ChevronLeft } from 'lucide-react'

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ tmdbId: string; n: string }>
}) {
  const { tmdbId: tmdbIdStr, n: nStr } = await params
  const tmdbId = parseInt(tmdbIdStr, 10)
  const seasonNumber = parseInt(nStr, 10)
  if (isNaN(tmdbId) || isNaN(seasonNumber)) notFound()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [episodes, watchesResult] = await Promise.all([
    getOrFetchSeason(tmdbId, seasonNumber, supabase),
    user
      ? supabase
          .from('episode_watches')
          .select('*')
          .eq('user_id', user.id)
          .eq('show_id', tmdbId)
          .eq('season_number', seasonNumber)
      : Promise.resolve({ data: [] }),
  ])

  if (!episodes.length) notFound()

  const watches = (watchesResult.data ?? []) as EpisodeWatch[]
  const watchMap = new Map(
    watches.map((w) => [w.episode_number, w])
  )

  const watchedCount = watches.length
  const totalCount = episodes.length

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-1">
        <Link
          href={`/shows/${tmdbId}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to show
        </Link>
        <h1 className="text-2xl font-bold">Season {seasonNumber}</h1>
        <p className="text-sm text-muted-foreground">
          {watchedCount} / {totalCount} episodes watched
        </p>
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(watchedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card px-4">
        {episodes.map((episode) => (
          <EpisodeRow
            key={episode.episode_number}
            episode={episode}
            watch={watchMap.get(episode.episode_number) ?? null}
            showId={tmdbId}
          />
        ))}
      </div>
    </div>
  )
}
