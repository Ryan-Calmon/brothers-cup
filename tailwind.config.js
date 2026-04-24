/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3eeff",
          100: "#e0d4ff",
          200: "#c4a8ff",
          300: "#a987ff",
          400: "#8854ff",
          500: "#6b30e0",
          600: "#5524b3",
          700: "#3f1a86",
          800: "#28124e",
          900: "#16120f",
        },
        surface: {
          DEFAULT: "rgba(22, 18, 31, 0.85)",
          light: "rgba(40, 30, 58, 1)",
          border: "rgba(81, 61, 112, 1)",
        },
        gold: {
          200: "#fde9a8",
          300: "#fcd462",
          400: "#f4b223",
          500: "#d99413",
          600: "#a86d08",
        },
      },
      fontFamily: {
        sans: ["Sora", "Chivo", "system-ui", "sans-serif"],
        display: ["'Bebas Neue'", "Anton", "Impact", "sans-serif"],
        body: ["Sora", "Chivo", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        wider2: "0.18em",
      },
    },
  },
  plugins: [],
};

