/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0a0a0a',
          dark: '#121212',
          crimson: '#8b0000',
          neon: '#ff0033',
          neonHover: '#ff3366',
        }
      },
      boxShadow: {
        'neon': '0 0 15px rgba(255, 0, 51, 0.6)',
        'neon-strong': '0 0 25px rgba(255, 0, 51, 0.95)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        'glass': '12px',
      }
    },
  },
  plugins: [],
}
