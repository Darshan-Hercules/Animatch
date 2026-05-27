import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AnimeInfo } from '../lib/jikan';
import { AnimeCard } from './AnimeCard';

interface AnimeRowProps {
  id: string;
  title: string;
  subtitle?: string;
  animeList: AnimeInfo[];
  loading: boolean;
  watchlistIds: number[];
  onWatchlistToggle: (anime: AnimeInfo) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export function AnimeRow({
  id,
  title,
  subtitle,
  animeList,
  loading,
  watchlistIds,
  onWatchlistToggle,
  isAuthenticated,
  onOpenAuth,
}: AnimeRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll =
        direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

      rowRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  // Skeleton cards for loading state
  const skeletons = Array.from({ length: 6 });

  return (
    <section id={id} className="relative py-8 md:py-12 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between">
        <div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            {title}
          </h2>
          {subtitle && (
            <p className="text-gray-400 text-xs sm:text-sm font-semibold mt-1 font-mono tracking-wide">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Navigation Arrows */}
        {!loading && animeList.length > 0 && (
          <div className="hidden sm:flex items-center space-x-3 mt-4 sm:mt-0">
            <button
              onClick={() => scroll('left')}
              className="p-2.5 rounded-full border border-white/10 bg-black/60 text-gray-300 hover:text-brand-neon hover:border-brand-neon/40 hover:shadow-neon hover:bg-black/90 transition-all duration-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2.5 rounded-full border border-white/10 bg-black/60 text-gray-300 hover:text-brand-neon hover:border-brand-neon/40 hover:shadow-neon hover:bg-black/90 transition-all duration-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={rowRef}
          className="flex space-x-6 overflow-x-auto overflow-y-hidden py-4 no-scrollbar scroll-smooth"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {loading ? (
            skeletons.map((_, index) => (
              <div
                key={index}
                className="flex-none w-56 sm:w-64 aspect-[2/3] rounded-2xl bg-white/5 border border-white/5 animate-pulse flex flex-col justify-end p-4 space-y-3"
              >
                <div className="h-4 bg-white/10 rounded w-2/3" />
                <div className="h-6 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))
          ) : animeList.length > 0 ? (
            animeList.map((anime) => (
              <AnimeCard
                key={anime.mal_id}
                anime={anime}
                isInWatchlist={watchlistIds.includes(anime.mal_id)}
                onWatchlistToggle={onWatchlistToggle}
                isAuthenticated={isAuthenticated}
                onOpenAuth={onOpenAuth}
              />
            ))
          ) : (
            <div className="w-full flex items-center justify-center py-16 text-gray-500 font-semibold font-mono text-sm border border-dashed border-white/10 rounded-2xl">
              No anime found in this category.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
