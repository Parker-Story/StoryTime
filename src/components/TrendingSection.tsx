'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShowCard } from '@/components/ShowCard'

interface TrendingShow {
  id: number
  name: string
  poster_path: string | null
  first_air_date?: string | null
  vote_average: number
}

const INITIAL_COUNT = 10

export function TrendingSection({ shows, title = 'Popular Right Now' }: { shows: TrendingShow[], title?: string }) {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? shows : shows.slice(0, INITIAL_COUNT)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href="/search" className="text-sm text-primary hover:underline">
          Browse all shows →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {visible.map((show) => (
          <ShowCard
            key={show.id}
            tmdbId={show.id}
            name={show.name}
            posterPath={show.poster_path}
            year={show.first_air_date?.slice(0, 4)}
            communityRating={show.vote_average > 0 ? show.vote_average / 2 : null}
          />
        ))}
      </div>

      {shows.length > INITIAL_COUNT && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? '↑ Show less' : `↓ Show ${shows.length - INITIAL_COUNT} more`}
        </button>
      )}
    </section>
  )
}
