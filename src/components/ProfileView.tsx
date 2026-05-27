import React, { useState } from 'react';
import { Edit2, Check, Heart, Loader2 } from 'lucide-react';
import type { UserProfile } from '../hooks/useAuth';
import type { WatchlistItem } from '../hooks/useWatchlist';
import type { AnimeInfo } from '../lib/jikan';
import { AnimeCard } from './AnimeCard';

interface ProfileViewProps {
  profile: UserProfile | null;
  watchlist: WatchlistItem[];
  onWatchlistToggle: (anime: AnimeInfo) => void;
  onUpdateUsername: (newUsername: string) => Promise<void>;
  watchlistLoading: boolean;
}

export function ProfileView({
  profile,
  watchlist,
  onWatchlistToggle,
  onUpdateUsername,
  watchlistLoading,
}: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!profile) {
    return (
      <div id="watchlist" className="py-20 text-center bg-transparent">
        <div className="max-w-md mx-auto px-4 py-12 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md">
          <Heart className="w-12 h-12 text-brand-neon mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold text-white mb-2">Access Your Watchlist</h3>
          <p className="text-gray-400 text-sm font-sans mb-6">
            Join or sign in to save your favorite anime shows and track recommendations across all your devices.
          </p>
        </div>
      </div>
    );
  }

  const handleEditClick = () => {
    setNewUsername(profile.username);
    setIsEditing(true);
    setError(null);
  };

  const handleSaveClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || newUsername === profile.username) {
      setIsEditing(false);
      return;
    }

    setUpdating(true);
    setError(null);
    try {
      await onUpdateUsername(newUsername.trim());
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update username.');
    } finally {
      setUpdating(false);
    }
  };

  // Maps database watchlist items back to AnimeInfo structure for AnimeCard reuse
  const mapItemToAnimeInfo = (item: WatchlistItem): AnimeInfo => ({
    mal_id: item.anime_id,
    title: item.title,
    title_english: item.title,
    images: {
      jpg: {
        image_url: item.image_url,
        large_image_url: item.image_url,
      },
    },
    score: item.rating ? parseFloat(item.rating) : null,
    episodes: item.episodes,
    genres: item.genres.map((name, index) => ({ mal_id: index, name })),
    status: item.status,
    synopsis: null,
    year: null,
  });

  const watchlistIds = watchlist.map(item => item.anime_id);

  return (
    <section id="watchlist" className="py-16 md:py-24 bg-transparent border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Card Header */}
        <div className="relative rounded-3xl overflow-hidden border border-brand-crimson/25 bg-gradient-to-br from-brand-crimson/5 to-transparent p-8 md:p-10 mb-16 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-[0_8px_32px_rgba(255,0,51,0.05)]">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 bg-brand-neon/10 rounded-full blur-3xl pointer-events-none" />

          {/* Avatar Profile */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-brand-neon bg-brand-crimson/30 flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-neon">
            {profile.username[0].toUpperCase()}
          </div>

          {/* User Info & Settings */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-3">
              {isEditing ? (
                <form onSubmit={handleSaveClick} className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="px-4 py-1.5 rounded-lg bg-black/60 border border-brand-neon text-white font-bold outline-none text-lg shadow-neon"
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="p-2 rounded-lg bg-brand-neon hover:bg-brand-neonHover text-white transition-all shadow-neon"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                    {profile.username}
                  </h2>
                  <button
                    onClick={handleEditClick}
                    className="p-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-brand-neon transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {error && <p className="text-brand-neon text-xs font-semibold font-sans">{error}</p>}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-gray-400 text-xs sm:text-sm font-semibold pt-2">
              <span className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5">
                <Heart className="w-4 h-4 text-brand-neon fill-current" />
                <span className="text-white">{watchlist.length}</span>
                <span>Saved Anime</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/5 font-mono">
                Member since {new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Watchlist Library Section */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase mb-8">
            My Collection Library
          </h3>

          {watchlistLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-2xl bg-white/5 border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : watchlist.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {watchlist.map((item) => {
                const animeInfo = mapItemToAnimeInfo(item);
                return (
                  <div key={item.anime_id} className="flex justify-center">
                    <AnimeCard
                      anime={animeInfo}
                      isInWatchlist={watchlistIds.includes(item.anime_id)}
                      onWatchlistToggle={onWatchlistToggle}
                      isAuthenticated={true}
                      onOpenAuth={() => {}}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full text-center py-20 border border-dashed border-white/10 rounded-3xl">
              <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 font-mono text-sm font-semibold">
                Your library is empty. Add titles from Trending or search above!
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
