import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { useWatchlist } from './hooks/useWatchlist';
import { jikanApi } from './lib/jikan';
import type { AnimeInfo } from './lib/jikan';
import { IntroAnimation } from './components/IntroAnimation';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AnimeRow } from './components/AnimeRow';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { AnimeSearch } from './components/AnimeSearch';
import { Tv, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimeBackground } from './components/AnimeBackground';
import type { BackgroundTheme, ParticleDensity } from './components/AnimeBackground';
import { AestheticControls } from './components/AestheticControls';

function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeSection, setActiveSection] = useState('hero');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Aesthetic background state synced with localStorage
  const [theme, setTheme] = useState<BackgroundTheme>(() => {
    const saved = localStorage.getItem('animatch_bg_theme');
    return (saved as BackgroundTheme) || 'petals'; // Default to gorgeous red petals!
  });

  const [density, setDensity] = useState<ParticleDensity>(() => {
    const saved = localStorage.getItem('animatch_bg_density');
    return (saved as ParticleDensity) || 'medium';
  });

  const [opacity, setOpacity] = useState<number>(() => {
    const saved = localStorage.getItem('animatch_bg_opacity');
    return saved ? parseFloat(saved) : 0.65;
  });

  useEffect(() => {
    localStorage.setItem('animatch_bg_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('animatch_bg_density', density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem('animatch_bg_opacity', opacity.toString());
  }, [opacity]);

  // Authentication and Watchlist Hooks
  const { user, profile, updateUsername, signOut, signInAsGuest } = useAuth();
  const {
    watchlist,
    loading: watchlistLoading,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  } = useWatchlist(user?.id);

  // Anime Data States
  const [trendingAnime, setTrendingAnime] = useState<AnimeInfo[]>([]);
  const [recommendedAnime, setRecommendedAnime] = useState<AnimeInfo[]>([]);
  const [loadingAnime, setLoadingAnime] = useState(true);

  // Fetch Anime from Jikan
  useEffect(() => {
    async function fetchAnimeData() {
      try {
        const [trending, recommended] = await Promise.all([
          jikanApi.getTrending(12),
          jikanApi.getRecommendations(),
        ]);
        setTrendingAnime(trending);
        setRecommendedAnime(recommended);
      } catch (err) {
        console.error('Failed to load anime data:', err);
      } finally {
        setLoadingAnime(false);
      }
    }
    fetchAnimeData();
  }, []);

  // Sync scroll positions to update Navbar active indicator
  useEffect(() => {
    if (showIntro) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;

      const sections = ['hero', 'trending', 'recommended', 'watchlist'];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const offsetTop = el.offsetTop - 120;
          const offsetBottom = offsetTop + el.offsetHeight;
          if (scrollY >= offsetTop && scrollY < offsetBottom) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showIntro]);

  const handleWatchlistToggle = async (anime: AnimeInfo) => {
    const isSaved = isInWatchlist(anime.mal_id);
    try {
      if (isSaved) {
        await removeFromWatchlist(anime.mal_id);
      } else {
        await addToWatchlist(anime);
      }
    } catch (err) {
      console.error('Failed to update watchlist:', err);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const watchlistIds = watchlist.map((item) => item.anime_id);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 selection:bg-brand-neon selection:text-white relative">
      <AnimatePresence mode="wait">
        {showIntro ? (
          <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="flex flex-col min-h-screen relative"
          >
            {/* Interactive Crimson Anime Background Canvas */}
            <AnimeBackground theme={theme} density={density} opacity={opacity} />
            {/* Header Navbar */}
            <Navbar
              profile={profile}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenSearch={() => setIsSearchOpen(true)}
              onSignOut={signOut}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />

            {/* Cinematic Hero */}
            <Hero
              onExploreClick={() => scrollToSection('trending')}
              onTrendingClick={() => scrollToSection('trending')}
              onWatchlistClick={() => scrollToSection('watchlist')}
            />

            {/* Main Sections Content */}
            <main className="relative z-20 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]/92">
              {/* Trending Anime Row */}
              <AnimeRow
                id="trending"
                title="Trending Hits"
                subtitle="Most watched series this season"
                animeList={trendingAnime}
                loading={loadingAnime}
                watchlistIds={watchlistIds}
                onWatchlistToggle={handleWatchlistToggle}
                isAuthenticated={!!user}
                onOpenAuth={() => setIsAuthOpen(true)}
              />

              {/* Recommended Anime Row */}
              <AnimeRow
                id="recommended"
                title="Recommended For You"
                subtitle="Personalized recommendations"
                animeList={recommendedAnime}
                loading={loadingAnime}
                watchlistIds={watchlistIds}
                onWatchlistToggle={handleWatchlistToggle}
                isAuthenticated={!!user}
                onOpenAuth={() => setIsAuthOpen(true)}
              />

              {/* Profiles & Synced Watchlist Grid */}
              <ProfileView
                profile={profile}
                watchlist={watchlist}
                onWatchlistToggle={handleWatchlistToggle}
                onUpdateUsername={updateUsername}
                watchlistLoading={watchlistLoading}
              />
            </main>

            {/* Cinematic Premium Footer */}
            <footer className="relative z-20 bg-black/75 backdrop-blur-md border-t border-white/5 py-12 md:py-16 text-center">
              <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-6">
                <div className="flex items-center space-x-2">
                  <Tv className="w-6 h-6 text-brand-neon drop-shadow-[0_0_8px_#ff0033]" />
                  <span className="text-xl font-black font-sans tracking-tight text-white">
                    ANI<span className="text-brand-neon">MATCH</span>
                  </span>
                </div>
                <p className="text-gray-500 text-xs sm:text-sm font-sans max-w-sm leading-relaxed">
                  AniMatch is a high-fidelity cinematic project leveraging the Jikan (MAL) database and Supabase secure authentication.
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-gray-600 font-mono">
                  <Shield className="w-3.5 h-3.5" />
                  <span>SECURE SSL CLIENT BY SUPABASE</span>
                </div>
                <div className="text-[11px] text-gray-700 font-mono tracking-widest pt-4 uppercase">
                  © 2026 AniMatch Corp. All rights reserved.
                </div>
              </div>
            </footer>

            {/* Search Modal */}
            <AnimeSearch
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              watchlistIds={watchlistIds}
              onWatchlistToggle={handleWatchlistToggle}
              isAuthenticated={!!user}
              onOpenAuth={() => setIsAuthOpen(true)}
            />

            {/* Authentication Modal */}
            <AuthModal
              isOpen={isAuthOpen}
              onClose={() => setIsAuthOpen(false)}
              onSignInAsGuest={signInAsGuest}
            />

            {/* Floating Red Aesthetic Control Center */}
            <AestheticControls
              theme={theme}
              setTheme={setTheme}
              density={density}
              setDensity={setDensity}
              opacity={opacity}
              setOpacity={setOpacity}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
