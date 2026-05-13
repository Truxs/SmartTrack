/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: { 900: '#0f172a', 800: '#1e293b', 700: '#334155', 600: '#475569' },
        status: { good: '#22c55e', warning: '#eab308', danger: '#ef4444' }
      }
    },
  },
  plugins: [],
}