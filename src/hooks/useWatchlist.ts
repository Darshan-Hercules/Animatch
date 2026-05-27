import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { AnimeInfo } from '../lib/jikan';

export interface WatchlistItem {
  id: string;
  user_id: string;
  anime_id: number;
  title: string;
  image_url: string;
  rating: string | null;
  episodes: number | null;
  genres: string[];
  status: string;
  created_at: string;
}

export function useWatchlist(userId: string | undefined) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const isGuest = userId ? userId.startsWith('guest_') : false;

  useEffect(() => {
    if (userId) {
      if (isGuest) {
        fetchLocalWatchlist();
      } else {
        fetchWatchlist();
      }
    } else {
      setWatchlist([]);
    }
  }, [userId]);

  function fetchLocalWatchlist() {
    setLoading(true);
    try {
      const stored = localStorage.getItem('animatch_guest_watchlist');
      setWatchlist(stored ? JSON.parse(stored) : []);
    } catch (err: any) {
      console.error('Failed to fetch local watchlist:', err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchWatchlist() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('watchlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWatchlist(data || []);
    } catch (err: any) {
      console.error('Failed to fetch watchlist:', err.message);
    } finally {
      setLoading(false);
    }
  }

  const isInWatchlist = (animeId: number) => {
    return watchlist.some(item => item.anime_id === animeId);
  };

  async function addToWatchlist(anime: AnimeInfo) {
    if (!userId) return;

    const genresArray = anime.genres.map(g => g.name);
    const payload = {
      user_id: userId,
      anime_id: anime.mal_id,
      title: anime.title,
      image_url: anime.images.jpg.large_image_url || anime.images.jpg.image_url,
      rating: anime.score ? anime.score.toString() : null,
      episodes: anime.episodes,
      genres: genresArray,
      status: anime.status,
    };

    if (isGuest) {
      try {
        const newItem: WatchlistItem = {
          id: 'local_' + Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
          ...payload
        };
        const updated = [newItem, ...watchlist];
        localStorage.setItem('animatch_guest_watchlist', JSON.stringify(updated));
        setWatchlist(updated);
      } catch (err: any) {
        console.error('Failed to save to local watchlist:', err.message);
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('watchlist')
        .insert([payload])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Unique violation - already exists
          return;
        }
        throw error;
      }

      if (data) {
        setWatchlist((prev) => [data, ...prev]);
      }
    } catch (err: any) {
      console.error('Failed to add to watchlist:', err.message);
      throw err;
    }
  }

  async function removeFromWatchlist(animeId: number) {
    if (!userId) return;

    if (isGuest) {
      try {
        const updated = watchlist.filter(item => item.anime_id !== animeId);
        localStorage.setItem('animatch_guest_watchlist', JSON.stringify(updated));
        setWatchlist(updated);
      } catch (err: any) {
        console.error('Failed to remove from local watchlist:', err.message);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('watchlist')
        .delete()
        .eq('user_id', userId)
        .eq('anime_id', animeId);

      if (error) throw error;

      setWatchlist((prev) => prev.filter(item => item.anime_id !== animeId));
    } catch (err: any) {
      console.error('Failed to remove from watchlist:', err.message);
      throw err;
    }
  }

  return {
    watchlist,
    loading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    refresh: isGuest ? fetchLocalWatchlist : fetchWatchlist
  };
}
