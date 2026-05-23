import Image from 'next/image'
import Link from 'next/link'
import { TMDB_IMAGE_BASE } from '@/lib/tmdb/client'
import { StarDisplay } from './StarRating'
import { Badge } from '@/components/ui/badge'
import { WatchStatus } from '@/types/database'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'Watching',
  finished: 'Finished',
  want_to_watch: 'Want to Watch',
  dropped: 'Dropped',
}

const STATUS_COLORS: Record<WatchStatus, string> = {
  watching: 'bg-green-500/10 text-green-600 dark:text-green-400',
  finished: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  want_to_watch: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  dropped: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

interface ShowCardProps {
  tmdbId: number
  name: string
  posterPath: string | null
  watchStatus?: WatchStatus | null
  rating?: number | null
  communityRating?: number | null
  year?: string | null
}

export function ShowCard({
  tmdbId,
  name,
  posterPath,
  watchStatus,
  rating,
  communityRating,
  year,
}: ShowCardProps) {
  const displayRating = rating ?? communityRating

  return (
    <Link
      href={`/shows/${tmdbId}`}
      className="group block rounded-lg overflow-hidden border border-border bg-card hover:border-primary/50 transition-colors"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-muted">
        {posterPath ? (
          <Image
            src={`${TMDB_IMAGE_BASE}/w342${posterPath}`}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm px-2 text-center">
            {name}
          </div>
        )}
        {watchStatus && (
          <div className="absolute top-2 left-2">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', STATUS_COLORS[watchStatus])}>
              {STATUS_LABELS[watchStatus]}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 space-y-1">
        <p className="text-sm font-medium leading-tight line-clamp-2">{name}</p>
        <div className="flex items-center gap-1.5">
          {displayRating !== null && displayRating !== undefined && (
            <StarDisplay value={displayRating} size="sm" />
          )}
          {year && (
            <span className="text-xs text-muted-foreground">{year}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
