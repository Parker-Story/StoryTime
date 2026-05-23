'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { sendFriendRequest } from '@/lib/actions/friend-actions'
import Link from 'next/link'

interface SearchUser {
  id: string
  username: string
  avatar_url: string | null
}

export function UserSearch({ currentUserId }: { currentUserId: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchUser[]>([])
  const [sent, setSent] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults((data.users ?? []).filter((u: SearchUser) => u.id !== currentUserId))
    } finally {
      setLoading(false)
    }
  }, [currentUserId])

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query, search])

  async function handleAdd(userId: string) {
    const result = await sendFriendRequest(userId)
    if (result.error) {
      toast.error(result.error)
    } else {
      setSent((prev) => new Set([...prev, userId]))
      toast.success('Friend request sent!')
    }
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Search by username…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url ?? undefined} />
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <Link href={`/profile/${user.username}`} className="text-sm font-medium hover:underline">
                  {user.username}
                </Link>
              </div>
              <Button
                size="sm"
                variant={sent.has(user.id) ? 'outline' : 'default'}
                disabled={sent.has(user.id)}
                onClick={() => handleAdd(user.id)}
                className="text-xs"
              >
                {sent.has(user.id) ? 'Sent' : 'Add'}
              </Button>
            </div>
          ))}
        </div>
      )}
      {loading && (
        <p className="text-sm text-muted-foreground">Searching…</p>
      )}
      {!loading && query && results.length === 0 && (
        <p className="text-sm text-muted-foreground">No users found for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  )
}
