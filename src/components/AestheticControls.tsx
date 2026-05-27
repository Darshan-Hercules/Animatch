import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sliders, X, Flame, Moon, Compass, Terminal } from 'lucide-react';
import type { BackgroundTheme, ParticleDensity } from './AnimeBackground';

interface AestheticControlsProps {
  theme: BackgroundTheme;
  setTheme: (t: BackgroundTheme) => void;
  density: ParticleDensity;
  setDensity: (d: ParticleDensity) => void;
  opacity: number;
  setOpacity: (o: number) => void;
}

export function AestheticControls({
  theme,
  setTheme,
  density,
  setDensity,
  opacity,
  setOpacity,
}: AestheticControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const themes: { id: BackgroundTheme; label: string; icon: any; desc: string }[] = [
    { id: 'petals', label: 'Scarlet Petals', icon: Sparkles, desc: 'Dramatic falling red cherry blossoms' },
    { id: 'sparks', label: 'Crimson Sparks', icon: Flame, desc: 'Rising shonen neon-red sparks' },
    { id: 'stars', label: 'Ruby Stars', icon: Compass, desc: 'Twinkling ruby space stars & meteors' },
    { id: 'matrix', label: 'Red Matrix', icon: Terminal, desc: 'Glowing red cyber stream' },
    { id: 'none', label: 'Cinematic Off', icon: Moon, desc: 'Pure solid high-contrast dark mode' },
  ];

  const densities: { id: ParticleDensity; label: string }[] = [
    { id: 'low', label: 'Subtle' },
    { id: 'medium', label: 'Balanced' },
    { id: 'high', label: 'Intense' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40 font-sans" ref={panelRef}>
      <AnimatePresence>
        {/* Aesthetic Panel Card */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 glass-panel-neon p-6 rounded-2xl shadow-[0_10px_40px_rgba(255,0,51,0.25)] border border-brand-neon/30 text-white flex flex-col space-y-6"
            style={{
              background: 'rgba(10, 10, 10, 0.92)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-neon/20 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-brand-neon animate-pulse drop-shadow-[0_0_5px_#ff0033]" />
                <h3 className="text-lg font-black font-sans tracking-tight uppercase">
                  Aesthetic Center
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-brand-neon hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selectable Themes */}
            <div className="space-y-3">
              <span className="text-xs uppercase font-mono tracking-wider text-gray-400 block">
                Atmosphere Vibe
              </span>
              <div className="flex flex-col space-y-2 max-h-[190px] overflow-y-auto pr-1 no-scrollbar">
                {themes.map((t) => {
                  const Icon = t.icon;
                  const isActive = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex items-start space-x-3 p-2.5 rounded-xl border text-left transition-all duration-300 ${
                        isActive
                          ? 'border-brand-neon bg-brand-neon/15 shadow-[0_0_12px_rgba(255,0,51,0.15)] text-white'
                          : 'border-white/5 hover:border-brand-neon/40 hover:bg-white/5 text-gray-300 hover:text-white'
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-lg border ${
                          isActive
                            ? 'border-brand-neon bg-brand-neon/20 text-brand-neon'
                            : 'border-white/10 bg-white/5 text-gray-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold tracking-wide">{t.label}</span>
                        <span className="text-[11px] text-gray-500 font-sans mt-0.5">{t.desc}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {theme !== 'none' && (
              <>
                {/* Particle Density */}
                <div className="space-y-2">
                  <span className="text-xs uppercase font-mono tracking-wider text-gray-400 block">
                    Particle Density
                  </span>
                  <div className="grid grid-cols-3 gap-2 bg-black/40 p-1 rounded-xl border border-white/5">
                    {densities.map((d) => {
                      const isActive = density === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setDensity(d.id)}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-300 ${
                            isActive
                              ? 'bg-brand-neon text-white shadow-neon'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Particle Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-gray-400">
                    <span className="uppercase tracking-wider">Aura Opacity</span>
                    <span className="text-brand-neon font-bold">{Math.round(opacity * 100)}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Sliders className="w-4 h-4 text-gray-400" />
                    <input
                      type="range"
                      min="0.10"
                      max="1.00"
                      step="0.05"
                      value={opacity}
                      onChange={(e) => setOpacity(parseFloat(e.target.value))}
                      className="w-full h-1 bg-black/40 rounded-lg appearance-none cursor-pointer accent-brand-neon border border-white/10"
                    />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full flex items-center justify-center text-white glass-panel-neon hover:shadow-neon-strong transition-shadow duration-300 relative group overflow-hidden border border-brand-neon/40 shadow-neon"
        style={{
          background: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Core pulsing glow behind the button */}
        <div className="absolute inset-0 bg-brand-neon/10 rounded-full animate-ping pointer-events-none" />

        <Sparkles className="w-6 h-6 text-brand-neon group-hover:rotate-12 transition-transform duration-300 drop-shadow-[0_0_6px_#ff0033]" />
      </motion.button>
    </div>
  );
}
