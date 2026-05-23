'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { StarRating } from './StarRating'
import { Episode, EpisodeWatch } from '@/types/database'
import { markEpisodeWatched, unmarkEpisodeWatched, updateEpisodeWatch } from '@/lib/actions/episode-actions'
import { cn } from '@/lib/utils'

interface EpisodeRowProps {
  episode: Episode
  watch: EpisodeWatch | null
  showId: number
}

export function EpisodeRow({ episode, watch, showId }: EpisodeRowProps) {
  const [isPending, startTransition] = useTransition()
  const [isWatched, setIsWatched] = useState(!!watch)
  const [rating, setRating] = useState<number>(watch?.rating ?? 0)
  const [notes, setNotes] = useState(watch?.notes ?? '')
  const [expanded, setExpanded] = useState(false)
  const [ratingChanged, setRatingChanged] = useState(false)
  const [notesChanged, setNotesChanged] = useState(false)

  const hasDetail = isWatched && (expanded || ratingChanged || notesChanged)

  function toggleWatched() {
    const newWatched = !isWatched
    setIsWatched(newWatched)

    startTransition(async () => {
      if (newWatched) {
        const result = await markEpisodeWatched(
          showId,
          episode.season_number,
          episode.episode_number
        )
        if (result.error) {
          setIsWatched(!newWatched)
          toast.error(result.error)
        }
      } else {
        const result = await unmarkEpisodeWatched(
          showId,
          episode.season_number,
          episode.episode_number
        )
        if (result.error) {
          setIsWatched(!newWatched)
          toast.error(result.error)
        } else {
          setRating(0)
          setNotes('')
          setExpanded(false)
        }
      }
    })
  }

  function saveDetail() {
    startTransition(async () => {
      const result = await updateEpisodeWatch(
        showId,
        episode.season_number,
        episode.episode_number,
        { rating: rating > 0 ? rating : null, notes: notes.trim() || null }
      )
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Saved')
        setRatingChanged(false)
        setNotesChanged(false)
      }
    })
  }

  const airDateFormatted = episode.air_date
    ? new Date(episode.air_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <div className={cn('border-b border-border last:border-0 py-3', isPending && 'opacity-60')}>
      <div className="flex items-start gap-3">
        {/* Watched checkbox */}
        <div className="pt-0.5">
          <Checkbox
            checked={isWatched}
            onCheckedChange={toggleWatched}
            disabled={isPending}
            aria-label={`Mark S${episode.season_number}E${episode.episode_number} as watched`}
          />
        </div>

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <span className="text-xs text-muted-foreground font-mono">
                E{String(episode.episode_number).padStart(2, '0')}
              </span>
              <span className="ml-2 text-sm font-medium leading-tight">{episode.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isWatched && rating > 0 && (
                <StarRating value={rating} readOnly size="sm" />
              )}
              {isWatched && (
                <button
                  onClick={() => setExpanded((o) => !o)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                  {expanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
          {airDateFormatted && (
            <p className="text-xs text-muted-foreground mt-0.5">{airDateFormatted}</p>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {isWatched && expanded && (
        <div className="ml-7 mt-3 space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Episode rating</p>
            <StarRating
              value={rating}
              onChange={(v) => { setRating(v); setRatingChanged(true) }}
              size="md"
            />
          </div>
          <Textarea
            placeholder="Notes (optional)…"
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesChanged(true) }}
            rows={2}
            className="resize-none text-sm"
          />
          {(ratingChanged || notesChanged) && (
            <Button size="sm" onClick={saveDetail} disabled={isPending}>
              Save
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
