/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a18',
        cream: '#f5f0e8',
        terra: '#c0623a',
        gold: '#d4a853',
        muted: '#8a7f72',
        warm: '#e8e0d0',
      },
      fontFamily: {
        serif: ["'Cormorant Garamond'", "serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      keyframes: {
        'toast-in': {
          '0%': { transform: 'translateY(1.5rem)', opacity: '0' },
          '70%': { transform: 'translateY(-0.2rem)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
    },
  },
  plugins: [],
}
