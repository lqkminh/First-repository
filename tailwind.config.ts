import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        missa: {
          wine: "#7d243c",
          wineDark: "#5f192d",
          gold: "#b89a62",
          ink: "#26251f",
          paper: "#faf8f2",
          sage: "#526b58"
        }
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["Arial", "Helvetica", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(42, 35, 24, .07)"
      }
    }
  },
  plugins: []
};
export default config;
