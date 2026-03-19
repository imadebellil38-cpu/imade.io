import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#e8eef5",
          100: "#c5d5e8",
          200: "#9fb9d9",
          300: "#799dca",
          400: "#5c87be",
          500: "#3f72b3",
          600: "#1e3a5f",
          700: "#1a3253",
          800: "#152a46",
          900: "#0f1f33",
        },
        accent: {
          50: "#fdf3e8",
          100: "#fbe0c3",
          200: "#f5c48a",
          300: "#efa851",
          400: "#ea9339",
          500: "#e67e22",
          600: "#cf6e18",
          700: "#b25d13",
          800: "#8e4b0f",
          900: "#6a380b",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
