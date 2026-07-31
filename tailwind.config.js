/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', lg: '2rem' },
      screens: { '2xl': '1320px' }
    },
    extend: {
      colors: {
        gold: {
          50: '#FBF7EE',
          100: '#F6EDD9',
          200: '#EDDCB4',
          300: '#E0C687',
          400: '#D3AF5A',
          500: '#C69A3C', // primary
          600: '#AC7F2C',
          700: '#8A6323',
          800: '#63471A',
          900: '#3E2C10'
        },
        ink: {
          DEFAULT: '#16130F',
          50: '#F6F5F3',
          100: '#E8E5E0',
          200: '#CFCAC2',
          300: '#A9A297',
          400: '#7C746A',
          500: '#584F46',
          600: '#3D362F',
          700: '#2A2520',
          800: '#1D1915',
          900: '#100E0B'
        },
        cream: {
          DEFAULT: '#FAF7F1',
          dark: '#F2ECE1'
        },
        moss: '#33413A'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 4px 24px -6px rgba(22,19,15,0.12)',
        lift: '0 18px 45px -18px rgba(22,19,15,0.35)',
        gold: '0 12px 32px -12px rgba(198,154,60,0.55)'
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(120deg,#8A6323 0%,#C69A3C 30%,#EDDCB4 50%,#C69A3C 70%,#8A6323 100%)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } }
      },
      animation: {
        'fade-up': 'fade-up .6s cubic-bezier(.22,.68,0,1) both',
        'fade-in': 'fade-in .5s ease both',
        marquee: 'marquee 26s linear infinite',
        shimmer: 'shimmer 2.4s linear infinite'
      }
    }
  },
  plugins: []
};
