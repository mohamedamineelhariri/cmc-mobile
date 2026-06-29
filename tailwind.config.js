/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cmc: {
          teal: "#32acc1",
          "teal-dark": "#1b6f7d",
          navy: "#0a2e38",
          gold: "#ebbb31",
        },
      },
    },
  },
  plugins: [],
};
