/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ferrari-red': '#ff0000',
      },
      backgroundColor: {
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        'card-dark': 'rgba(255, 255, 255, 0.05)',
      },
      borderColor: {
        'ferrari': '#ff0000',
      },
      textColor: {
        'ferrari': '#ff0000',
      },
      boxShadow: {
        'ferrari': '0 0 20px rgba(255, 0, 0, 0.5)',
        'ferrari-lg': '0 0 30px rgba(255, 0, 0, 0.6)',
        'ferrari-xl': '0 0 40px rgba(255, 0, 0, 0.7)',
      },
      textShadow: {
        'ferrari': '0 4px 20px rgba(255, 0, 0, 0.3)',
      },
      keyframes: {
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      animation: {
        slideDown: 'slideDown 0.8s ease-in-out',
        slideUp: 'slideUp 0.8s ease-in-out 0.6s both',
        fadeIn: 'fadeIn 1s ease-in-out 0.3s both',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
