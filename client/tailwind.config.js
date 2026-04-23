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
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Dark-mode primary
          600: '#4f46e5',
          700: '#4338CA', // Light-mode primary
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        accent: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0D9488', // Teal accent
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        surface: '#F8FAFC',       // Light bg
        'dark-surface': '#0F172A', // Dark bg (Slate 900)
        'dark-card': '#1E293B',    // Dark card bg (Slate 800)
        'dark-card-hover': '#334155', // Dark card hover (Slate 700)
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'mesh-gradient': 'radial-gradient(at 0% 0%, rgba(67,56,202,0.12) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(13,148,136,0.12) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(99,102,241,0.08) 0%, transparent 50%)',
        'mesh-gradient-dark': 'radial-gradient(at 0% 0%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(at 100% 0%, rgba(13,148,136,0.12) 0%, transparent 50%), radial-gradient(at 50% 100%, rgba(67,56,202,0.10) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
