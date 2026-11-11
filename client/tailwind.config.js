/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: {
            DEFAULT: '#0B192C',
            light: '#1E293B',
            dark: '#08101E',
            muted: '#334155',
          },
          teal: {
            DEFAULT: '#0D9488',
            light: '#14B8A6',
            dark: '#0F766E',
            soft: '#CCFBF1',
            accent: '#2DD4BF',
          },
          sand: '#F8FAFC',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
