'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)

  const pushSearch = useCallback(
    (q: string) => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      router.push(`/search?${params.toString()}`)
    },
    [router]
  )

  useEffect(() => {
    if (value === defaultValue) return
    const timer = setTimeout(() => pushSearch(value), 300)
    return () => clearTimeout(timer)
  }, [value, defaultValue, pushSearch])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search TV shows…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            clearTimeout(undefined)
            pushSearch(value)
          }
        }}
        className="pl-9"
        autoFocus
      />
    </div>
  )
}
