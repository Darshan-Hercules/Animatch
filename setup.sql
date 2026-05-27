-- Create a public profiles table linked to Supabase Auth users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create public watchlist table for storing saved anime
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  anime_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  rating TEXT,
  episodes INTEGER,
  genres TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  -- Ensure a user can only add an anime once to their watchlist
  CONSTRAINT unique_user_anime UNIQUE (user_id, anime_id)
);

-- Enable Row Level Security (RLS) for tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-----------------------------------------
-- PROFILES ROW LEVEL SECURITY POLICIES --
-----------------------------------------

-- Allow any authenticated/public user to read profiles (needed to see other users' sync pages)
CREATE POLICY "Allow public read access on profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow users to update only their own profile
CREATE POLICY "Allow users to update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


------------------------------------------
-- WATCHLIST ROW LEVEL SECURITY POLICIES --
------------------------------------------

-- Allow any user to read watchlists (needed for the sync feature where friends view watchlists)
CREATE POLICY "Allow public read access on watchlists"
  ON public.watchlist FOR SELECT
  USING (true);

-- Allow authenticated users to insert their own watchlist items
CREATE POLICY "Allow users to insert their own watchlist items"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own watchlist items
CREATE POLICY "Allow users to delete their own watchlist items"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);


--------------------------------------------------------------------------
-- AUTOMATIC PROFILE TRIGGER ON SIGN UP
-- When a user signs up in auth.users, automatically create a public profile!
--------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Otaku_' || substr(NEW.id::text, 1, 6)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run handle_new_user function on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
