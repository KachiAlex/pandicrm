import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        "base-950": "var(--base-950)",
        "base-900": "var(--base-900)",
        "base-800": "var(--base-800)",
        "base-700": "var(--base-700)",
        "base-600": "var(--base-600)",
        "base-500": "var(--base-500)",
        "base-400": "var(--base-400)",
        "base-50": "var(--base-50)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        border: "var(--border)",
        primary: "var(--accent-primary)",
        secondary: "var(--accent-secondary)",
        tertiary: "var(--accent-tertiary)",
      },
      backgroundImage: {
        aurora: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary) 45%, var(--accent-tertiary))",
      },
    },
  },
  plugins: [],
};

export default config;
