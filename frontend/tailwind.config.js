/** @type {import('tailwindcss').Config} */
export default {
  // This is the crucial part: tells Tailwind where to find your class names
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scans all relevant files in your src folder
  ],

  theme: {
    extend: {
      // Here we add the custom animations for the landing page
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'fade-in-down': 'fade-in-down 1s ease-out forwards',
        'fade-in-up': 'fade-in-up 1s ease-out forwards 0.3s',
      }
    },
  },

  plugins: [],
}