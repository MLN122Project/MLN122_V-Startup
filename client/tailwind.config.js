/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          sky:      '#38BDF8',
          mint:     '#34D399',
          orange:   '#F97316',
          yellow:   '#FACC15',
          lavender: '#A78BFA',
          pink:     '#F43F5E',
        },
      },
      backgroundImage: {
        'game': 'linear-gradient(135deg, #E0F7FA 0%, #FFF7D6 50%, #FFE4EC 100%)',
        'hero': 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 35%, #FFF7ED 65%, #FFF1F2 100%)',
      },
      animation: {
        'float':       'float 3s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2.5s ease-in-out infinite',
        'slide-up':    'slideUp 0.4s ease-out',
        'fade-in':     'fadeIn 0.5s ease-out',
        'bounce-soft': 'bounceSoft 1s ease-in-out infinite',
        'spin-slow':   'spin 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(56,189,248,0)' },
          '50%':      { boxShadow: '0 0 24px 6px rgba(56,189,248,0.25)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(56,189,248,0.15)',
        'glass-lg': '0 16px 48px rgba(56,189,248,0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 40px rgba(56,189,248,0.2)',
      },
    },
  },
  plugins: [],
}
