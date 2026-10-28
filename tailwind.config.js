/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: ['bg-card', 'bg-butter', 'bg-mint', 'bg-lav', 'bg-sky', 'bg-peach', 'bg-rose'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF6EA',
        card: '#FFFBF5',
        ink: '#2E2540',
        soft: '#5B4F6E',
        grape: '#6B4FA0',
        grapedark: '#53397F',
        peach: '#FFD8C4',
        mint: '#CDEFDD',
        lav: '#E4DBFB',
        sky: '#D2E8FB',
        butter: '#FFF0B8',
        rose: '#FBD3E2',
        line: '#E8D9C6',
      },
      fontFamily: { sans: ['ui-rounded', 'Nunito', 'system-ui', 'Segoe UI', 'sans-serif'] },
      keyframes: {
        wiggle: { '0%,100%': { transform: 'rotate(-4deg)' }, '50%': { transform: 'rotate(4deg)' } },
        pop: { '0%': { transform: 'scale(.6)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        rise: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        wiggle: 'wiggle .5s ease-in-out infinite',
        pop: 'pop .4s ease-out both',
        rise: 'rise .4s ease-out both',
      },
    },
  },
  plugins: [],
};
