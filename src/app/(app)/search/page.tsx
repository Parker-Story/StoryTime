import { Suspense } from 'react'
import { searchShows } from '@/lib/tmdb/client'
import { ShowCard } from '@/components/ShowCard'
import { SearchBar } from '@/components/SearchBar'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Search Shows — StoryTime' }

async function SearchResults({ q }: { q: string }) {
  if (!q) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Start typing to search for TV shows
      </p>
    )
  }

  const data = await searchShows(q)

  if (!data.results.length) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No results for &ldquo;{q}&rdquo;
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {data.results.map((show) => (
        <ShowCard
          key={show.id}
          tmdbId={show.id}
          name={show.name}
          posterPath={show.poster_path}
          year={show.first_air_date?.slice(0, 4)}
          communityRating={show.vote_average > 0 ? (show.vote_average / 2) : null}
        />
      ))}
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Search Shows</h1>
      <SearchBar defaultValue={q} />
      <Suspense key={q} fallback={<SearchSkeleton />}>
        <SearchResults q={q} />
      </Suspense>
    </div>
  )
}
