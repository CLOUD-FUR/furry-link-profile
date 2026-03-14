import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.12)",
        glow: "0 0 24px rgba(147, 197, 253, 0.45)",
      },
      backdropBlur: {
        glass: "18px",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
      keyframes: {
        slideInRight: {
          from: { opacity: "0", transform: "translateX(1.25rem)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
