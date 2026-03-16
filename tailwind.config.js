/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        space: "#0D0A1A",
        primaryViolet: "#A855F7",
        primaryPink: "#EC4899",
        primaryIndigo: "#818CF8",
        // Editorial design tokens
        cream: "#f5f0e8",
        ink: "#1a1a1a",
        muted: "#888888",
        ghost: "#cccccc",
        accent: "#1a1a1a",
        accent2: "#444444",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg,#1a1a1a,#444444)",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        garamond: ["var(--font-garamond)", "Georgia", "serif"],
        jakarta:  ["var(--font-jakarta)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

module.exports = config;
