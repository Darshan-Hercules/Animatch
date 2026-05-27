import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safe mock initialization to prevent runtime crash when credentials are missing (e.g. GitHub Pages)
const createMockSupabase = () => {
  console.warn('Supabase credentials not found or incomplete. Using local Guest Mode fallback.');
  
  const mockHandler = {
    get(_target: any, prop: string): any {
      if (prop === 'auth') {
        return {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({
            data: {
              subscription: { unsubscribe: () => {} }
            }
          }),
          signOut: () => Promise.resolve({ error: null })
        };
      }
      
      // Fallback for database queries (.from().select(), etc.)
      const dummyChain = () => new Proxy({}, {
        get(_t: any, p: string) {
          if (p === 'then') {
            return (resolve: any) => resolve({ data: null, error: new Error('Supabase is not configured') });
          }
          return dummyChain;
        }
      });


      return dummyChain;
    }
  };

  return new Proxy({}, mockHandler);
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createMockSupabase() as any);

