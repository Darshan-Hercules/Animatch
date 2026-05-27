import { useState, useEffect } from 'react';
import { Search, Menu, X, LogOut, Tv } from 'lucide-react';
import type { UserProfile } from '../hooks/useAuth';

interface NavbarProps {
  profile: UserProfile | null;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
  onSignOut: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export function Navbar({
  profile,
  onOpenAuth,
  onOpenSearch,
  onSignOut,
  activeSection,
  setActiveSection,
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'trending', label: 'Trending' },
    { id: 'recommended', label: 'Recommended' },
    { id: 'watchlist', label: 'My Watchlist' },
  ];

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'bg-black/90 shadow-[0_4px_30px_rgba(255,0,51,0.15)] border-b border-brand-crimson/20 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div 
            onClick={() => handleNavClick('hero')} 
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <Tv className="w-8 h-8 text-brand-neon group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_8px_#ff0033]" />
            <span className="text-2xl font-black font-sans tracking-tight text-white group-hover:text-brand-neon transition-colors duration-300">
              ANI<span className="text-brand-neon">MATCH</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-semibold tracking-wide uppercase transition-all duration-300 hover:text-brand-neon hover:text-neon-subtle ${
                  activeSection === item.id 
                    ? 'text-brand-neon border-b-2 border-brand-neon pb-1 text-neon-subtle' 
                    : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-gray-300 hover:text-brand-neon hover:glow-red-hover transition-colors duration-300 rounded-full hover:bg-white/5"
            >
              <Search className="w-5 h-5" />
            </button>

            {profile ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-white/10">
                <button
                  onClick={() => handleNavClick('watchlist')}
                  className="flex items-center space-x-2 text-gray-300 hover:text-brand-neon transition-all"
                >
                  <span className="text-sm font-medium">{profile.username}</span>
                  <div className="w-8 h-8 rounded-full border border-brand-crimson bg-brand-crimson/30 flex items-center justify-center text-white text-sm font-black shadow-neon">
                    {profile.username[0].toUpperCase()}
                  </div>
                </button>
                <button
                  onClick={onSignOut}
                  className="p-2 text-gray-300 hover:text-brand-neon transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="ml-4 px-6 py-2 rounded-full border border-brand-neon bg-brand-neon/10 hover:bg-brand-neon text-white font-semibold text-sm transition-all duration-300 shadow-neon hover:shadow-neon-strong"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={onOpenSearch}
              className="p-2 text-gray-300 hover:text-brand-neon"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-brand-neon"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass-panel-neon absolute top-full left-0 right-0 border-t border-brand-neon/20 shadow-2xl py-4 px-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left text-base font-bold uppercase transition-colors py-2 ${
                  activeSection === item.id ? 'text-brand-neon text-neon-subtle' : 'text-gray-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-white/5 flex flex-col space-y-4">
            {profile ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full border border-brand-crimson bg-brand-crimson/30 flex items-center justify-center text-white text-base font-black shadow-neon">
                    {profile.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{profile.username}</p>
                    <p className="text-gray-500 text-xs">Logged in via Supabase</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-brand-neon text-gray-300 hover:text-brand-neon transition-all font-semibold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-full bg-brand-neon hover:bg-brand-neonHover text-white font-bold text-sm text-center shadow-neon"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
