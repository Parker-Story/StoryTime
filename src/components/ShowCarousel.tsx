'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ShowCard } from '@/components/ShowCard'

const PAGE_SIZE = 5

interface CarouselShow {
  id: number
  name: string
  poster_path: string | null
  first_air_date?: string | null
  vote_average: number
}

export function ShowCarousel({ shows, title }: { shows: CarouselShow[], title: string }) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(shows.length / PAGE_SIZE)
  const visible = shows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href="/search" className="text-sm text-primary hover:underline">
          Browse all shows →
        </Link>
      </div>

      <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {page > 0 && (
          <button
            onClick={() => setPage(p => p - 1)}
            aria-label="Previous"
            className="absolute left-2 top-[30%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

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

        {page < totalPages - 1 && (
          <button
            onClick={() => setPage(p => p + 1)}
            aria-label="Next"
            className="absolute right-2 top-[30%] -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow flex items-center justify-center hover:bg-background transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  )
}
