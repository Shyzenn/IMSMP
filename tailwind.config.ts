import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f2f3f4",
        foreground: "var(--foreground)",
      },
      screens: {
        '3xl': '1920px'
      }
    },
  },
  plugins: [],
} satisfies Config;
