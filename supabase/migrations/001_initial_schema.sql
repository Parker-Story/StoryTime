-- StoryTime: Initial Schema
-- Run this in your Supabase SQL editor or via the Supabase CLI

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  email text not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz
);

CREATE TABLE friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references profiles(id) on delete cascade not null,
  addressee_id uuid references profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted')) default 'pending',
  created_at timestamptz default now(),
  unique(requester_id, addressee_id),
  check (requester_id != addressee_id)
);

CREATE TABLE shows (
  tmdb_id integer primary key,
  name text not null,
  poster_path text,
  backdrop_path text,
  overview text,
  first_air_date date,
  number_of_seasons integer,
  status text,
  genres jsonb,
  cached_at timestamptz default now()
);

CREATE TABLE episodes (
  tmdb_show_id integer references shows(tmdb_id) on delete cascade,
  season_number integer not null,
  episode_number integer not null,
  name text not null,
  overview text,
  air_date date,
  still_path text,
  runtime integer,
  primary key (tmdb_show_id, season_number, episode_number)
);

CREATE TABLE show_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  show_id integer references shows(tmdb_id) on delete cascade not null,
  watch_status text check (watch_status in ('watching', 'finished', 'want_to_watch', 'dropped')),
  rating numeric(2,1) check (rating >= 0 and rating <= 5 and mod(rating * 2, 1) = 0),
  review_body text,
  review_contains_spoilers boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, show_id)
);

CREATE TABLE episode_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  show_id integer not null,
  season_number integer not null,
  episode_number integer not null,
  watched_at timestamptz default now(),
  rating numeric(2,1) check (rating >= 0 and rating <= 5 and mod(rating * 2, 1) = 0),
  notes text,
  foreign key (show_id, season_number, episode_number)
    references episodes(tmdb_show_id, season_number, episode_number) on delete cascade,
  unique(user_id, show_id, season_number, episode_number)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX idx_show_interactions_user_id ON show_interactions(user_id);
CREATE INDEX idx_show_interactions_show_id ON show_interactions(show_id);
CREATE INDEX idx_show_interactions_updated_at ON show_interactions(updated_at desc);
CREATE INDEX idx_episode_watches_user_show ON episode_watches(user_id, show_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);

-- ─── Helper view for bidirectional friendship queries ─────────────────────────

CREATE VIEW friendships_normalized AS
  SELECT requester_id as user_a, addressee_id as user_b, status, id FROM friendships
  UNION ALL
  SELECT addressee_id as user_a, requester_id as user_b, status, id FROM friendships;

-- ─── Triggers ─────────────────────────────────────────────────────────────────

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_show_interactions_updated_at
  BEFORE UPDATE ON show_interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_watches ENABLE ROW LEVEL SECURITY;

-- profiles: public read, own write
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete" ON profiles FOR DELETE USING (auth.uid() = id);

-- friendships: visible to both parties, insert by requester
CREATE POLICY "friendships_select" ON friendships FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships_insert" ON friendships FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "friendships_update" ON friendships FOR UPDATE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);
CREATE POLICY "friendships_delete" ON friendships FOR DELETE
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- shows: public read, authenticated write (for caching)
CREATE POLICY "shows_select" ON shows FOR SELECT USING (true);
CREATE POLICY "shows_insert" ON shows FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "shows_update" ON shows FOR UPDATE USING (auth.role() = 'authenticated');

-- episodes: public read, authenticated write (for caching)
CREATE POLICY "episodes_select" ON episodes FOR SELECT USING (true);
CREATE POLICY "episodes_insert" ON episodes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "episodes_update" ON episodes FOR UPDATE USING (auth.role() = 'authenticated');

-- show_interactions: public read (friend feeds, profiles), own write
CREATE POLICY "show_interactions_select" ON show_interactions FOR SELECT USING (true);
CREATE POLICY "show_interactions_insert" ON show_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "show_interactions_update" ON show_interactions FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "show_interactions_delete" ON show_interactions FOR DELETE
  USING (auth.uid() = user_id);

-- episode_watches: private (own rows only)
CREATE POLICY "episode_watches_select" ON episode_watches FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "episode_watches_insert" ON episode_watches FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "episode_watches_update" ON episode_watches FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "episode_watches_delete" ON episode_watches FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Storage ──────────────────────────────────────────────────────────────────
-- Run in Supabase dashboard: create a public bucket named "avatars"
-- Then add this storage policy:
-- INSERT policy: bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
-- UPDATE/DELETE: same condition
