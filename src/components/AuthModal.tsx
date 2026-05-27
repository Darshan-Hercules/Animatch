import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, X, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInAsGuest: () => void;
}

export function AuthModal({ isOpen, onClose, onSignInAsGuest }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setUsername('');
      setError(null);
      setLoading(false);
      setSignUpSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up with custom username meta
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.trim() || `Otaku_${Math.floor(Math.random() * 10000)}`,
            },
          },
        });

        if (signUpError) throw signUpError;
        setSignUpSuccess(true);
      } else {
        // Sign In
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative w-full max-w-md rounded-2xl border border-brand-crimson/30 bg-[#0f0f0f] p-8 shadow-[0_8px_32px_0_rgba(255,0,51,0.12)] z-10 overflow-hidden"
          >
            {/* Red accent glowing dot in corner */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-brand-neon/20 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 hover:border-brand-neon hover:text-brand-neon transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {signUpSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex p-3.5 bg-brand-neon/10 border border-brand-neon rounded-full text-brand-neon shadow-neon">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Account Created!</h3>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto font-sans">
                  Success! Please check your email inbox to confirm your registration, then sign in to access your AniMatch watchlist.
                </p>
                <button
                  onClick={() => {
                    setSignUpSuccess(false);
                    setIsSignUp(false);
                  }}
                  className="mt-4 px-6 py-2 bg-brand-neon hover:bg-brand-neonHover text-white font-bold rounded-full transition-all duration-300 shadow-neon"
                >
                  Go to Sign In
                </button>
              </div>
            ) : (
              <div>
                {/* Title */}
                <h2 className="text-3xl font-black text-white tracking-tight uppercase mb-2">
                  {isSignUp ? 'Join AniMatch' : 'Welcome Back'}
                </h2>
                <p className="text-gray-400 text-sm mb-6 font-sans">
                  {isSignUp
                    ? 'Create your Otaku profile to start syncing.'
                    : 'Sign in to access your synchronized watchlist.'}
                </p>

                {/* Error Banner */}
                {error && (
                  <div className="mb-5 flex items-start space-x-2.5 p-3 rounded-lg bg-brand-neon/10 border border-brand-neon/40 text-brand-neon text-xs font-semibold font-sans">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-neon outline-none focus:bg-black/50 text-white font-semibold transition-all duration-300 focus:shadow-neon"
                      />
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-neon outline-none focus:bg-black/50 text-white font-semibold transition-all duration-300 focus:shadow-neon"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-brand-neon outline-none focus:bg-black/50 text-white font-semibold transition-all duration-300 focus:shadow-neon"
                    />
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-brand-neon hover:bg-brand-neonHover text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-neon hover:shadow-neon-strong flex items-center justify-center space-x-2 mt-6 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                    )}
                  </button>

                  <div className="relative flex py-3 items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-gray-500 text-xs font-mono tracking-wider uppercase">OR</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSignInAsGuest();
                      onClose();
                    }}
                    className="w-full py-3.5 rounded-xl border border-brand-crimson/30 hover:border-brand-crimson bg-black/40 hover:bg-brand-crimson/10 text-gray-300 hover:text-white font-bold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Instant Guest Login</span>
                  </button>
                </form>

                {/* Switch Mode Trigger */}
                <div className="mt-6 text-center text-xs font-semibold font-sans">
                  <span className="text-gray-400">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  </span>{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                    className="text-brand-neon hover:underline hover:text-brand-neonHover pl-1 transition-colors"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
