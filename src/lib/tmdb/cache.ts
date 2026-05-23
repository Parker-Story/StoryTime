import { SupabaseClient } from '@supabase/supabase-js'
import { Database, Show, Episode, Json } from '@/types/database'
import { getShowDetails, getSeasonDetails } from './client'

type DB = Database

export async function getOrFetchShow(
  tmdbId: number,
  supabase: SupabaseClient<DB>
): Promise<Show | null> {
  // Check cache (fresh if cached within 7 days)
  const { data: cached } = await supabase
    .from('shows')
    .select('*')
    .eq('tmdb_id', tmdbId)
    .gt('cached_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .single()

  if (cached) return cached

  // Fetch from TMDB and upsert
  try {
    const detail = await getShowDetails(tmdbId)
    const row: Database['public']['Tables']['shows']['Insert'] = {
      tmdb_id: detail.id,
      name: detail.name,
      poster_path: detail.poster_path,
      backdrop_path: detail.backdrop_path,
      overview: detail.overview,
      first_air_date: detail.first_air_date || null,
      number_of_seasons: detail.number_of_seasons,
      status: detail.status,
      genres: detail.genres as unknown as Json,
      cached_at: new Date().toISOString(),
    }
    const { data, error } = await supabase
      .from('shows')
      .upsert(row as never, { onConflict: 'tmdb_id' })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (err) {
    console.error('Failed to fetch/cache show:', err)
    return null
  }
}

export async function getOrFetchSeason(
  tmdbId: number,
  seasonNumber: number,
  supabase: SupabaseClient<DB>
): Promise<Episode[]> {
  // Check if we have any episodes for this season already
  const { data: cached } = await supabase
    .from('episodes')
    .select('*')
    .eq('tmdb_show_id', tmdbId)
    .eq('season_number', seasonNumber)
    .order('episode_number')

  if (cached && cached.length > 0) return cached

  // Fetch from TMDB and bulk upsert
  try {
    const season = await getSeasonDetails(tmdbId, seasonNumber)
    const rows = season.episodes.map((ep) => ({
      tmdb_show_id: tmdbId,
      season_number: ep.season_number,
      episode_number: ep.episode_number,
      name: ep.name,
      overview: ep.overview || null,
      air_date: ep.air_date || null,
      still_path: ep.still_path || null,
      runtime: ep.runtime || null,
    }))

    if (rows.length === 0) return []

    const { data, error } = await supabase
      .from('episodes')
      .upsert(rows as never[], { onConflict: 'tmdb_show_id,season_number,episode_number' })
      .select()
      .order('episode_number')

    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error('Failed to fetch/cache season:', err)
    return []
  }
}
