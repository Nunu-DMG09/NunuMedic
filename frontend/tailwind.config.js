/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ¡ESTO ES CRUCIAL!
  theme: {
    extend: {},
  },
  plugins: [],
}