export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          username: string
          email: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          username?: string
          email?: string
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string | null
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: 'pending' | 'accepted'
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: 'pending' | 'accepted'
          created_at?: string
        }
        Update: {
          status?: 'pending' | 'accepted'
        }
      }
      shows: {
        Row: {
          tmdb_id: number
          name: string
          poster_path: string | null
          backdrop_path: string | null
          overview: string | null
          first_air_date: string | null
          number_of_seasons: number | null
          status: string | null
          genres: Json | null
          cached_at: string
        }
        Insert: {
          tmdb_id: number
          name: string
          poster_path?: string | null
          backdrop_path?: string | null
          overview?: string | null
          first_air_date?: string | null
          number_of_seasons?: number | null
          status?: string | null
          genres?: Json | null
          cached_at?: string
        }
        Update: {
          name?: string
          poster_path?: string | null
          backdrop_path?: string | null
          overview?: string | null
          first_air_date?: string | null
          number_of_seasons?: number | null
          status?: string | null
          genres?: Json | null
          cached_at?: string
        }
      }
      episodes: {
        Row: {
          tmdb_show_id: number
          season_number: number
          episode_number: number
          name: string
          overview: string | null
          air_date: string | null
          still_path: string | null
          runtime: number | null
        }
        Insert: {
          tmdb_show_id: number
          season_number: number
          episode_number: number
          name: string
          overview?: string | null
          air_date?: string | null
          still_path?: string | null
          runtime?: number | null
        }
        Update: {
          name?: string
          overview?: string | null
          air_date?: string | null
          still_path?: string | null
          runtime?: number | null
        }
      }
      show_interactions: {
        Row: {
          id: string
          user_id: string
          show_id: number
          watch_status: WatchStatus | null
          rating: number | null
          review_body: string | null
          review_contains_spoilers: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          show_id: number
          watch_status?: WatchStatus | null
          rating?: number | null
          review_body?: string | null
          review_contains_spoilers?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          watch_status?: WatchStatus | null
          rating?: number | null
          review_body?: string | null
          review_contains_spoilers?: boolean
          updated_at?: string
        }
      }
      episode_watches: {
        Row: {
          id: string
          user_id: string
          show_id: number
          season_number: number
          episode_number: number
          watched_at: string
          rating: number | null
          notes: string | null
        }
        Insert: {
          id?: string
          user_id: string
          show_id: number
          season_number: number
          episode_number: number
          watched_at?: string
          rating?: number | null
          notes?: string | null
        }
        Update: {
          watched_at?: string
          rating?: number | null
          notes?: string | null
        }
      }
    }
    Views: {
      friendships_normalized: {
        Row: {
          user_a: string
          user_b: string
          status: 'pending' | 'accepted'
          id: string
        }
      }
    }
  }
}

export type WatchStatus = 'watching' | 'finished' | 'want_to_watch' | 'dropped'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Friendship = Database['public']['Tables']['friendships']['Row']
export type Show = Database['public']['Tables']['shows']['Row']
export type Episode = Database['public']['Tables']['episodes']['Row']
export type ShowInteraction = Database['public']['Tables']['show_interactions']['Row']
export type EpisodeWatch = Database['public']['Tables']['episode_watches']['Row']

export type ShowInteractionWithProfile = ShowInteraction & {
  profiles: Pick<Profile, 'id' | 'username' | 'avatar_url'>
  shows: Pick<Show, 'tmdb_id' | 'name' | 'poster_path'>
}
