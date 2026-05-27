import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  useEffect(() => {
    // Auto-trigger completion after 4.2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 4200);

    return () => {
      clearTimeout(timer);
    };
  }, [onComplete]);

  // Framer Motion variants for letters
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.4,
      },
    },
  };

  const letterVariants = {
    hidden: { 
      y: 30, 
      opacity: 0,
      scale: 0.8,
      filter: 'blur(10px)'
    },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring' as const,
        damping: 10,
        stiffness: 100,
      }
    },
  };

  const logoText = "ANIMATCH";

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
      {/* Intro Brand Content */}
      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex space-x-1 sm:space-x-2 md:space-x-3"
        >
          {logoText.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={letterVariants}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tight text-white select-none text-neon font-sans"
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Dynamic Light Sweep Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '80%', opacity: [0, 0.8, 0.8, 0] }}
          transition={{ delay: 1.8, duration: 1.6, ease: 'easeInOut' }}
          className="h-[2px] bg-gradient-to-r from-transparent via-[#ff0033] to-transparent mt-4 shadow-[0_0_10px_#ff0033]"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.7, y: 0 }}
          transition={{ delay: 2.5, duration: 1.0 }}
          className="text-xs sm:text-sm tracking-[0.4em] uppercase text-brand-neon mt-4 font-mono select-none text-neon-subtle"
        >
          Discover Your Next Anime
        </motion.p>
      </div>

      {/* Screen Flash Transition at the end */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1] }}
        transition={{ delay: 3.9, duration: 0.3, ease: 'easeIn' }}
        className="absolute inset-0 bg-black pointer-events-none"
      />
    </div>
  );
}
