'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { StarRating } from './StarRating'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { upsertShowInteraction, deleteShowInteraction } from '@/lib/actions/show-actions'
import { ShowInteraction, WatchStatus } from '@/types/database'

interface Props {
  showId: number
  initialInteraction: ShowInteraction | null
}

const WATCH_STATUS_OPTIONS: { value: WatchStatus; label: string }[] = [
  { value: 'watching', label: 'Watching' },
  { value: 'finished', label: 'Finished' },
  { value: 'want_to_watch', label: 'Want to Watch' },
  { value: 'dropped', label: 'Dropped' },
]

export function ShowInteractionPanel({ showId, initialInteraction }: Props) {
  const [isPending, startTransition] = useTransition()
  const [watchStatus, setWatchStatus] = useState<WatchStatus | null>(
    initialInteraction?.watch_status ?? null
  )
  const [rating, setRating] = useState<number>(initialInteraction?.rating ?? 0)
  const [reviewBody, setReviewBody] = useState(initialInteraction?.review_body ?? '')
  const [containsSpoilers, setContainsSpoilers] = useState(
    initialInteraction?.review_contains_spoilers ?? false
  )
  const [reviewOpen, setReviewOpen] = useState(!!initialInteraction?.review_body)

  function save() {
    startTransition(async () => {
      const result = await upsertShowInteraction(showId, {
        watchStatus,
        rating: rating > 0 ? rating : null,
        reviewBody: reviewBody.trim() || null,
        reviewContainsSpoilers: containsSpoilers,
      })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Saved!')
      }
    })
  }

  function clear() {
    startTransition(async () => {
      const result = await deleteShowInteraction(showId)
      if (result.error) {
        toast.error(result.error)
      } else {
        setWatchStatus(null)
        setRating(0)
        setReviewBody('')
        setContainsSpoilers(false)
        setReviewOpen(false)
        toast.success('Removed from your list')
      }
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      {/* Watch Status */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status</Label>
        <Select
          value={watchStatus ?? ''}
          onValueChange={(v) => setWatchStatus(v as WatchStatus || null)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Add to list…" />
          </SelectTrigger>
          <SelectContent>
            {WATCH_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Your Rating</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="text-xs text-muted-foreground">{rating} / 5</p>
        )}
      </div>

      {/* Review toggle */}
      <div>
        <button
          onClick={() => setReviewOpen((o) => !o)}
          className="text-sm text-primary hover:underline"
        >
          {reviewOpen ? 'Hide review' : (initialInteraction?.review_body ? 'Edit review' : '+ Add review')}
        </button>
      </div>

      {reviewOpen && (
        <div className="space-y-3">
          <Textarea
            placeholder="Write your review…"
            value={reviewBody}
            onChange={(e) => setReviewBody(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <div className="flex items-center gap-2">
            <Checkbox
              id="spoilers"
              checked={containsSpoilers}
              onCheckedChange={(checked) => setContainsSpoilers(!!checked)}
            />
            <Label htmlFor="spoilers" className="text-sm font-normal cursor-pointer">
              Contains spoilers
            </Label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={save}
          disabled={isPending || (!watchStatus && rating === 0 && !reviewBody.trim())}
          size="sm"
          className="flex-1"
        >
          {isPending ? 'Saving…' : 'Save'}
        </Button>
        {initialInteraction && (
          <Button
            onClick={clear}
            disabled={isPending}
            variant="outline"
            size="sm"
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
