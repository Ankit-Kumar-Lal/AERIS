/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#102F15',
          dark: '#0A1E0E',
          deep: '#061308',
          light: '#1B4722',
        },
        emerald: {
          DEFAULT: '#339966',
          hover: '#298055',
          active: '#216644',
          subtle: '#E6F5EC',
        },
        mint: {
          DEFAULT: '#66CC99',
          light: '#8CE0B4',
          dark: '#45AA78',
        },
        'soft-mint': {
          DEFAULT: '#D3FEEA',
          tint: '#E8FFF5',
        },
        'pale-green': {
          DEFAULT: '#EBFADC',
          tint: '#F4FCED',
          deep: '#DCEFCA',
        },
        'pale-lime': {
          DEFAULT: '#EAF1B1',
          accent: '#DAE398',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F6FBF1',
          dark: '#0E2312',
          contrast: '#000000',
        },
        risk: {
          high: '#DC2626',
          'high-bg': '#FEF2F2',
          'high-border': '#FCA5A5',
          medium: '#D97706',
          'medium-bg': '#FFFBEB',
          'medium-border': '#FCD34D',
          low: '#339966',
          'low-bg': '#ECFDF5',
          'low-border': '#A7F3D0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'sentinel-sm': '0 1px 3px rgba(16, 47, 21, 0.08), 0 1px 2px rgba(16, 47, 21, 0.04)',
        'sentinel-md': '0 4px 6px -1px rgba(16, 47, 21, 0.08), 0 2px 4px -1px rgba(16, 47, 21, 0.04)',
        'sentinel-lg': '0 10px 15px -3px rgba(16, 47, 21, 0.1), 0 4px 6px -2px rgba(16, 47, 21, 0.05)',
        'sentinel-xl': '0 20px 25px -5px rgba(16, 47, 21, 0.12), 0 10px 10px -5px rgba(16, 47, 21, 0.04)',
        'emerald-glow': '0 0 20px rgba(51, 153, 102, 0.35)',
        'high-contrast': '0 0 0 2px #339966',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2.5s ease-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
