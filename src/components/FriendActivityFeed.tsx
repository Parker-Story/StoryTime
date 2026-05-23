import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { StarDisplay } from './StarRating'

interface ActivityItem {
  id: string
  username: string
  avatarUrl: string | null
  showName: string
  showId: number
  watchStatus: string | null
  rating: number | null
  reviewBody: string | null
  updatedAt: string
}

function getActivityText(item: ActivityItem): string {
  if (item.watchStatus === 'watching') return `started watching`
  if (item.watchStatus === 'finished') return `finished`
  if (item.watchStatus === 'want_to_watch') return `added to watchlist`
  if (item.watchStatus === 'dropped') return `dropped`
  if (item.rating) return `rated`
  return `logged`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function FriendActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (!activities.length) {
    return (
      <p className="text-muted-foreground text-sm py-4">
        No friend activity yet. Add friends to see what they&apos;re watching!
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((item) => (
        <div key={item.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
          <Link href={`/profile/${item.username}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="text-xs">
                {item.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0 space-y-0.5">
            <p className="text-sm">
              <Link href={`/profile/${item.username}`} className="font-medium hover:underline">
                {item.username}
              </Link>
              {' '}
              <span className="text-muted-foreground">{getActivityText(item)}</span>
              {' '}
              <Link href={`/shows/${item.showId}`} className="font-medium hover:underline">
                {item.showName}
              </Link>
            </p>
            {item.rating !== null && (
              <StarDisplay value={item.rating} size="sm" />
            )}
            {item.reviewBody && (
              <p className="text-xs text-muted-foreground line-clamp-2">{item.reviewBody}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatDate(item.updatedAt)}
          </span>
        </div>
      ))}
    </div>
  )
}
