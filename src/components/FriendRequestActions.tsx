'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { acceptFriendRequest, declineFriendRequest, removeFriend } from '@/lib/actions/friend-actions'

interface Props {
  friendshipId: string
  mode?: 'request' | 'remove'
}

export function FriendRequestActions({ friendshipId, mode = 'request' }: Props) {
  const [isPending, startTransition] = useTransition()

  function accept() {
    startTransition(async () => {
      const result = await acceptFriendRequest(friendshipId)
      if (result.error) toast.error(result.error)
      else toast.success('Friend added!')
    })
  }

  function decline() {
    startTransition(async () => {
      const result = await declineFriendRequest(friendshipId)
      if (result.error) toast.error(result.error)
    })
  }

  function remove() {
    startTransition(async () => {
      const result = await removeFriend(friendshipId)
      if (result.error) toast.error(result.error)
      else toast.success('Friend removed')
    })
  }

  if (mode === 'remove') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={remove}
        disabled={isPending}
        className="text-xs"
      >
        Remove
      </Button>
    )
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" onClick={accept} disabled={isPending}>
        Accept
      </Button>
      <Button variant="outline" size="sm" onClick={decline} disabled={isPending}>
        Decline
      </Button>
    </div>
  )
}
