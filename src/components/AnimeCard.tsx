import React, { useRef, useState } from 'react';
import { Heart, Star, Tv, Hash } from 'lucide-react';
import type { AnimeInfo } from '../lib/jikan';

interface AnimeCardProps {
  anime: AnimeInfo;
  isInWatchlist: boolean;
  onWatchlistToggle: (anime: AnimeInfo) => void;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export function AnimeCard({
  anime,
  isInWatchlist,
  onWatchlistToggle,
  isAuthenticated,
  onOpenAuth,
}: AnimeCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  // 3D Card Tilt Math
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    
    // Rotate scaling factor
    const rotateX = -y / (box.height / 15);
    const rotateY = x / (box.width / 15);

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: 'transform 0.1s ease-out',
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
    });
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      onOpenAuth();
    } else {
      onWatchlistToggle(anime);
    }
  };

  const rating = anime.score ? anime.score.toFixed(1) : 'N/A';
  const genres = anime.genres.slice(0, 2).map((g) => g.name);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex-none w-56 sm:w-64 aspect-[2/3] rounded-2xl overflow-hidden glass-panel border border-white/5 cursor-pointer select-none group transition-all duration-300"
      style={{
        ...tiltStyle,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Background Poster Image */}
      <img
        src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
        alt={anime.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Glow Border Overlay */}
      <div className="absolute inset-0 border border-transparent group-hover:border-brand-neon/40 group-hover:shadow-neon rounded-2xl transition-all duration-300 pointer-events-none z-30" />

      {/* Dark Gradient Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 z-10 transition-opacity duration-300 group-hover:opacity-90" />

      {/* Top Floating Tags */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20" style={{ transform: 'translateZ(30px)' }}>
        {/* Score Tag */}
        <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-xs font-black text-brand-neon shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
          <Star className="w-3.5 h-3.5 fill-current text-brand-neon" />
          <span>{rating}</span>
        </div>

        {/* Watchlist Toggle Heart */}
        <button
          onClick={handleWatchlistClick}
          className={`p-2 rounded-full border backdrop-blur-md transition-all duration-300 shadow-md ${
            isInWatchlist
              ? 'bg-brand-neon/80 border-brand-neon text-white hover:scale-110 shadow-neon'
              : 'bg-black/60 border-white/10 text-gray-400 hover:text-brand-neon hover:border-brand-neon/50 hover:bg-black/80 hover:scale-110'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWatchlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Info Overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col justify-end transition-all duration-300"
        style={{ transform: 'translateZ(40px)' }}
      >
        {/* Genre Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {genres.map((genre, i) => (
            <span
              key={i}
              className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-neon/20 border border-brand-neon/30 text-white shadow-sm"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-2 drop-shadow-md group-hover:text-brand-neon transition-colors duration-300">
          {anime.title}
        </h3>

        {/* Extra Slide-down metadata details */}
        <div className="max-h-0 opacity-0 group-hover:max-h-12 group-hover:opacity-100 overflow-hidden transition-all duration-500 ease-in-out mt-1.5">
          <div className="flex items-center space-x-4 text-gray-400 text-xs font-semibold pt-1.5 border-t border-white/10">
            <span className="flex items-center space-x-1">
              <Tv className="w-3 h-3 text-brand-neon" />
              <span>{anime.episodes ? `${anime.episodes} eps` : 'Ongoing'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Hash className="w-3 h-3 text-brand-neon" />
              <span>{anime.status.replace('Currently Airing', 'Airing').replace('Finished Airing', 'Done')}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
