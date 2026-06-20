import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2C5282",
        secondary: "#4A5568",
        background: "#FAFAF8",
        surface: "#FFFFFF",
        text: "#1A202C",
        "text-muted": "#5A6B7A",
        accent: "#8B6914",
        border: "#E2E8F0",
        highlight: "#EBF4FF",
      },
      fontFamily: {
        serif: ['"Songti SC"', '"STSong"', '"Noto Serif SC"', "Georgia", "serif"],
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Noto Sans SC"', "sans-serif"],
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
