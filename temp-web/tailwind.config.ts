import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        pk: {
          50: "#fff0f7",
          100: "#ffd6ec",
          200: "#ffadd9",
          300: "#ff80c4",
          400: "#ff4dae",
          500: "#ff1a97",
          600: "#e6006b",
          700: "#b80055",
          800: "#8a003f",
          900: "#5c002a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
