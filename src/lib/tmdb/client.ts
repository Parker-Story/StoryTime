import {
  TMDBSearchResponse,
  TMDBTrendingResponse,
  TMDBShowDetail,
  TMDBSeason,
} from '@/types/tmdb'

const BASE_URL = 'https://api.themoviedb.org/3'
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

function getHeaders() {
  return {
    Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

async function tmdbFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
    ...options,
  })
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

export async function searchShows(
  query: string,
  page = 1
): Promise<TMDBSearchResponse> {
  return tmdbFetch(
    `/search/tv?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`
  )
}

export async function getTrendingShows(): Promise<TMDBTrendingResponse> {
  return tmdbFetch('/trending/tv/week', {
    next: { revalidate: 3600 },
  } as RequestInit)
}

export async function getTopRatedShows(): Promise<TMDBTrendingResponse> {
  return tmdbFetch('/tv/top_rated', {
    next: { revalidate: 86400 },
  } as RequestInit)
}

export async function getOnTheAirShows(): Promise<TMDBTrendingResponse> {
  return tmdbFetch('/tv/on_the_air', {
    next: { revalidate: 3600 },
  } as RequestInit)
}

export async function getShowDetails(tmdbId: number): Promise<TMDBShowDetail> {
  return tmdbFetch(`/tv/${tmdbId}`)
}

export async function getSeasonDetails(
  tmdbId: number,
  seasonNumber: number
): Promise<TMDBSeason> {
  return tmdbFetch(`/tv/${tmdbId}/season/${seasonNumber}`)
}
