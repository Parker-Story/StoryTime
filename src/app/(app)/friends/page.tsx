import { createClient } from '@/lib/supabase/server'
import { FriendRequestActions } from '@/components/FriendRequestActions'
import { UserSearch } from '@/components/UserSearch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Profile, Friendship } from '@/types/database'

export const metadata = { title: 'Friends — StoryTime' }

type FriendshipWithProfile = Friendship & {
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>
}

export default async function FriendsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [incomingResult, outgoingResult, friendsResult] = await Promise.all([
    // Incoming pending requests (others sent to me)
    supabase
      .from('friendships')
      .select('*, profiles!friendships_requester_id_fkey(id, username, avatar_url)')
      .eq('addressee_id', user.id)
      .eq('status', 'pending'),

    // Outgoing pending requests (I sent to others)
    supabase
      .from('friendships')
      .select('*, profiles!friendships_addressee_id_fkey(id, username, avatar_url)')
      .eq('requester_id', user.id)
      .eq('status', 'pending'),

    // Accepted friends (I could be either requester or addressee)
    supabase
      .from('friendships')
      .select('*, profiles!friendships_requester_id_fkey(id, username, avatar_url), profiles_addressee:profiles!friendships_addressee_id_fkey(id, username, avatar_url)')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
      .eq('status', 'accepted'),
  ])

  const incoming = (incomingResult.data ?? []) as FriendshipWithProfile[]
  const outgoing = (outgoingResult.data ?? []) as FriendshipWithProfile[]
  const friends = (friendsResult.data ?? []) as (Friendship & {
    profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>
    profiles_addressee: Pick<Profile, 'id' | 'username' | 'avatar_url'>
  })[]

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="text-2xl font-bold">Friends</h1>

      {/* Find users */}
      <div className="space-y-3">
        <h2 className="font-semibold">Find People</h2>
        <UserSearch currentUserId={user.id} />
      </div>

      {/* Incoming requests */}
      {incoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Friend Requests ({incoming.length})</h2>
          <div className="space-y-2">
            {incoming.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={req.profiles.avatar_url ?? undefined} />
                    <AvatarFallback>{req.profiles.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Link href={`/profile/${req.profiles.username}`} className="font-medium hover:underline text-sm">
                    {req.profiles.username}
                  </Link>
                </div>
                <FriendRequestActions friendshipId={req.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outgoing pending */}
      {outgoing.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Pending Requests</h2>
          <div className="space-y-2">
            {outgoing.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={req.profiles.avatar_url ?? undefined} />
                    <AvatarFallback>{req.profiles.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Link href={`/profile/${req.profiles.username}`} className="font-medium hover:underline text-sm">
                    {req.profiles.username}
                  </Link>
                </div>
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends list */}
      <div className="space-y-3">
        <h2 className="font-semibold">
          Your Friends ({friends.length})
        </h2>
        {friends.length === 0 ? (
          <p className="text-sm text-muted-foreground">No friends yet. Search for people above!</p>
        ) : (
          <div className="space-y-2">
            {friends.map((f) => {
              const friend = f.requester_id === user.id ? f.profiles_addressee : f.profiles
              return (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.avatar_url ?? undefined} />
                      <AvatarFallback>{friend.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Link href={`/profile/${friend.username}`} className="font-medium hover:underline text-sm">
                      {friend.username}
                    </Link>
                  </div>
                  <FriendRequestActions friendshipId={f.id} mode="remove" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
