/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          start: '#4F46E5',
          end: '#0EA5E9',
          dark: '#0C1120',
        }
      }
    },
  },
  plugins: [],
}