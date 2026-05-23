'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarDisplay } from './StarRating'
import { cn } from '@/lib/utils'

interface ReviewCardProps {
  username: string
  avatarUrl?: string | null
  rating?: number | null
  reviewBody: string
  containsSpoilers: boolean
  updatedAt: string
  currentUserId?: string
  reviewUserId?: string
  onEdit?: () => void
  onDelete?: () => void
}

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diff = now - date.getTime()
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(diff / 3_600_000)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.floor(diff / 86_400_000)
  if (days < 30) return rtf.format(-days, 'day')
  const months = Math.floor(days / 30)
  if (months < 12) return rtf.format(-months, 'month')
  return rtf.format(-Math.floor(months / 12), 'year')
}

export function ReviewCard({
  username,
  avatarUrl,
  rating,
  reviewBody,
  containsSpoilers,
  updatedAt,
  currentUserId,
  reviewUserId,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const [spoilerRevealed, setSpoilerRevealed] = useState(false)
  const isOwner = currentUserId && reviewUserId && currentUserId === reviewUserId

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={avatarUrl ?? undefined} alt={username} />
            <AvatarFallback className="text-xs">
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/profile/${username}`}
            className="text-sm font-medium hover:underline"
          >
            {username}
          </Link>
          {rating !== null && rating !== undefined && (
            <StarDisplay value={rating} size="sm" />
          )}
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {formatRelative(updatedAt)}
        </span>
      </div>

      {/* Review body with spoiler toggle */}
      <div className="relative">
        <p
          className={cn(
            'text-sm leading-relaxed transition-all',
            containsSpoilers && !spoilerRevealed && 'blur-sm select-none'
          )}
        >
          {reviewBody}
        </p>
        {containsSpoilers && !spoilerRevealed && (
          <button
            onClick={() => setSpoilerRevealed(true)}
            className="absolute inset-0 flex items-center justify-center text-sm font-medium text-primary hover:underline"
          >
            ⚠️ Contains spoilers — click to reveal
          </button>
        )}
      </div>

      {containsSpoilers && spoilerRevealed && (
        <button
          onClick={() => setSpoilerRevealed(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Hide spoilers
        </button>
      )}

      {/* Owner actions */}
      {isOwner && (onEdit || onDelete) && (
        <div className="flex gap-3 pt-1 border-t border-border">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-destructive hover:text-destructive/80"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
