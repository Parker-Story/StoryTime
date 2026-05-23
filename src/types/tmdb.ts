export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  genre_ids: number[]
  vote_average: number
  vote_count: number
  popularity: number
}

export interface TMDBShowDetail {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  last_air_date: string | null
  status: string
  number_of_seasons: number
  number_of_episodes: number
  genres: TMDBGenre[]
  vote_average: number
  vote_count: number
  popularity: number
  seasons: TMDBSeasonSummary[]
  tagline: string | null
  networks: Array<{ id: number; name: string; logo_path: string | null }>
  created_by: Array<{ id: number; name: string }>
}

export interface TMDBSeasonSummary {
  id: number
  season_number: number
  name: string
  overview: string
  poster_path: string | null
  air_date: string | null
  episode_count: number
}

export interface TMDBSeason {
  id: number
  season_number: number
  name: string
  overview: string
  poster_path: string | null
  air_date: string | null
  episodes: TMDBEpisode[]
}

export interface TMDBEpisode {
  id: number
  season_number: number
  episode_number: number
  name: string
  overview: string
  air_date: string | null
  still_path: string | null
  runtime: number | null
  vote_average: number
}

export interface TMDBSearchResponse {
  page: number
  results: TMDBShow[]
  total_pages: number
  total_results: number
}

export interface TMDBTrendingResponse {
  page: number
  results: TMDBShow[]
  total_pages: number
  total_results: number
}
