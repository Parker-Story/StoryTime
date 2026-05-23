'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { sendFriendRequest, removeFriend, declineFriendRequest } from '@/lib/actions/friend-actions'

interface Props {
  targetUserId: string
  friendship: {
    id: string
    status: string
    isRequester: boolean
  } | null
}

export function AddFriendButton({ targetUserId, friendship }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleAction() {
    startTransition(async () => {
      if (!friendship) {
        const result = await sendFriendRequest(targetUserId)
        if (result.error) toast.error(result.error)
        else toast.success('Friend request sent!')
      } else if (friendship.status === 'accepted') {
        const result = await removeFriend(friendship.id)
        if (result.error) toast.error(result.error)
        else toast.success('Friend removed')
      } else if (friendship.status === 'pending' && friendship.isRequester) {
        const result = await declineFriendRequest(friendship.id)
        if (result.error) toast.error(result.error)
        else toast.success('Request cancelled')
      }
    })
  }

  if (!friendship) {
    return (
      <Button size="sm" onClick={handleAction} disabled={isPending}>
        Add Friend
      </Button>
    )
  }

  if (friendship.status === 'pending') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={friendship.isRequester ? handleAction : undefined}
        disabled={isPending || !friendship.isRequester}
      >
        {friendship.isRequester ? 'Cancel Request' : 'Pending'}
      </Button>
    )
  }

  return (
    <Button size="sm" variant="outline" onClick={handleAction} disabled={isPending}>
      Friends ✓
    </Button>
  )
}
