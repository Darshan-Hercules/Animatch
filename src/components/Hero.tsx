import { useEffect, useState, useRef } from 'react';
import { Play, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import gsap from 'gsap';

interface HeroProps {
  onExploreClick: () => void;
  onTrendingClick: () => void;
  onWatchlistClick: () => void;
}

export function Hero({ onExploreClick, onTrendingClick, onWatchlistClick }: HeroProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    // 1. Check if Supabase storage URL is configured
    const envUrl = import.meta.env.VITE_BACKGROUND_VIDEO_URL;
    if (envUrl) {
      setVideoUrl(envUrl);
    } else {
      // 2. Default to local folder file (the One Piece scene they will upload)
      // 3. Fallback to a high-quality online cyberpunk loop so it looks beautiful out-of-the-box
      setVideoUrl('./videos/background.mp4');
    }
  }, []);

  // GSAP Parallax Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Move video slower than text for parallax depth
      if (videoRef.current) {
        gsap.to(videoRef.current, {
          y: scrollY * 0.45,
          duration: 0.1,
          ease: 'none',
        });
      }

      // Fade and move title upwards on scroll
      if (titleRef.current) {
        gsap.to(titleRef.current, {
          y: scrollY * -0.2,
          opacity: 1 - scrollY / 600,
          duration: 0.1,
          ease: 'none',
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // If local video fails to load, fallback to a beautiful cyberpunk video
  const handleVideoError = () => {
    console.log("Local video not found, loading online cinematic fallback...");
    // A high-quality dark futuristic neon looping background video
    setVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-city-street-with-neon-lights-in-the-rain-41846-large.mp4');
  };

  return (
    <div
      id="hero"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#0a0a0a]"
    >
      {/* Background Video */}
      {videoUrl && (
        <video
          ref={videoRef}
          key={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          className="absolute inset-0 w-full h-[120%] object-cover opacity-60 filter blur-[2px]"
          style={{ transform: 'translate3d(0, 0, 0)', willChange: 'transform' }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Cinematic Contrast Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a] z-10" />
      
      {/* Dynamic Radial Darkening Vignette */}
      <div 
        className="absolute inset-0 z-10" 
        style={{
          background: 'radial-gradient(circle, transparent 20%, rgba(10, 10, 10, 0.95) 95%)',
        }}
      />

      {/* Hero Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 text-center flex flex-col items-center">
        <div ref={titleRef} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-brand-neon/30 bg-brand-neon/5 text-brand-neon text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] shadow-neon mb-6">
              PREMIUM ANIME EDIT PLATFORM
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-white uppercase select-none leading-none"
          >
            ANI<span className="text-brand-neon text-neon">MATCH</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut', delay: 0.6 }}
            className="text-lg sm:text-2xl font-medium tracking-wide text-gray-300 font-sans max-w-2xl mx-auto"
          >
            Immerse yourself in cinematic visuals, sync your watchlist, and discover your next obsession.
          </motion.p>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut', delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-12 w-full max-w-xl"
        >
          <button
            onClick={onExploreClick}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-full bg-brand-neon hover:bg-brand-neonHover text-white font-bold text-base transition-all duration-300 hover:scale-105 shadow-neon hover:shadow-neon-strong"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Explore Anime</span>
          </button>

          <button
            onClick={onTrendingClick}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-full border border-brand-crimson bg-black/40 hover:bg-brand-crimson/20 text-gray-200 hover:text-white font-bold text-base transition-all duration-300 hover:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            <span>Trending Now</span>
          </button>

          <button
            onClick={onWatchlistClick}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-full border border-white/15 bg-black/20 hover:border-brand-neon/60 hover:bg-black/40 text-gray-300 hover:text-white font-bold text-base transition-all duration-300 hover:scale-105"
          >
            <Heart className="w-5 h-5" />
            <span>Watchlist</span>
          </button>
        </motion.div>
      </div>

      {/* Hero Bottom Shadow fading into trending */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent z-20 pointer-events-none" />
    </div>
  );
}
