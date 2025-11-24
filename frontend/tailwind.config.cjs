/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Orbitron'", "sans-serif"],
        body: ["'Space Grotesk'", "sans-serif"],
      },
      colors: {
        primary: "#f97316",
        secondary: "#0ea5e9",
        accent: "#22c55e",
        dark: "#0b1021",
      },
    },
  },
  plugins: [],
};
