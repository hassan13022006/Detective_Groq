import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        noir: {
          950: "#08090b",
          900: "#0f1115",
          850: "#14171d",
          800: "#1a1e26",
          700: "#262b36",
          600: "#383f4e",
          500: "#4e576a",
          400: "#748096",
          300: "#9da8ba",
          200: "#c7d0dc",
          100: "#e5e9f0",
        },
        dossier: {
          paper: "#f3eedf",
          darkpaper: "#1b1916",
          folder: "#8a6a4b",
          tab: "#ab8a66",
          stampRed: "#b91c1c",
          stampGreen: "#15803d",
          gold: "#d4af37",
          amber: "#f59e0b",
        },
      },
      fontFamily: {
        typewriter: ["Courier New", "Courier", "monospace"],
        heading: ["Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        dossier: "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        glowRed: "0 0 20px -3px rgba(239, 68, 68, 0.4)",
        glowAmber: "0 0 20px -3px rgba(245, 158, 11, 0.4)",
        glowCyan: "0 0 20px -3px rgba(6, 182, 212, 0.3)",
      },
      animation: {
        pulseFast: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        stampIn: "stampIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
      keyframes: {
        stampIn: {
          "0%": { opacity: "0", transform: "scale(2.5) rotate(-15deg)" },
          "50%": { opacity: "0.8", transform: "scale(0.95) rotate(-11deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(-12deg)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
