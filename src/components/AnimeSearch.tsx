import { useState, useEffect, useRef } from 'react';
import { Search, X, Star } from 'lucide-react';
import { jikanApi } from '../lib/jikan';
import type { AnimeInfo } from '../lib/jikan';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimeSearchProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistIds: number[];
  onWatchlistToggle: (anime: AnimeInfo) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export function AnimeSearch({
  isOpen,
  onClose,
  watchlistIds,
  onWatchlistToggle,
  isAuthenticated,
  onOpenAuth,
}: AnimeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await jikanApi.search(query);
        setResults(searchResults);
      } catch (err) {
        console.error('Failed to search:', err);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md overflow-y-auto"
        >
          {/* Header Controls */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <span className="text-gray-400 font-mono text-xs uppercase tracking-widest hidden sm:inline">
              Press [ESC] to exit search
            </span>
            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-brand-neon hover:text-brand-neon hover:shadow-neon transition-all ml-auto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar Container */}
          <div className="max-w-4xl mx-auto px-4 pt-4 pb-12">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search anime title, studio, genre..."
                className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/5 border border-white/10 focus:border-brand-neon text-white text-lg sm:text-xl font-medium outline-none transition-all duration-300 shadow-inner focus:shadow-neon focus:bg-black/40"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-brand-neon" />
            </div>

            {/* Results Grid */}
            <div className="mt-12">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] rounded-2xl bg-white/5 border border-white/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div>
                  <h3 className="text-gray-400 text-xs sm:text-sm font-semibold uppercase tracking-widest mb-6 font-mono">
                    Search Results ({results.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {results.map((anime) => {
                      const isSaved = watchlistIds.includes(anime.mal_id);
                      return (
                        <div
                          key={anime.mal_id}
                          className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-neon/50 hover:shadow-neon transition-all duration-300 group cursor-pointer"
                        >
                          <img
                            src={anime.images.jpg.image_url}
                            alt={anime.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30 z-10" />

                          {/* Quick Rating Tag */}
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 text-xs font-bold text-brand-neon flex items-center space-x-1 z-20">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{anime.score ? anime.score.toFixed(1) : 'N/A'}</span>
                          </div>

                          {/* Save Trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAuthenticated) onOpenAuth();
                              else onWatchlistToggle(anime);
                            }}
                            className={`absolute top-3 right-3 p-1.5 rounded-full border backdrop-blur-sm z-20 transition-all ${
                              isSaved
                                ? 'bg-brand-neon border-brand-neon text-white'
                                : 'bg-black/50 border-white/15 text-gray-300 hover:text-brand-neon hover:border-brand-neon'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>

                          {/* Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-20">
                            <h4 className="text-white text-sm font-bold line-clamp-2 leading-snug">
                              {anime.title}
                            </h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : query.trim() ? (
                <div className="text-center py-20">
                  <p className="text-gray-400 font-mono text-sm font-semibold">
                    No results match "{query}". Try another search.
                  </p>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500 font-mono text-xs uppercase tracking-widest">
                  Type a title to search the mal database...
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
