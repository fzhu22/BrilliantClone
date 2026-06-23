import type { Config } from "tailwindcss";

// Brilliant-style dark-first palette, exposed as semantic tokens backed by the
// CSS variables defined in src/app/globals.css.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        border: "var(--border)",
        ink: "var(--text)",
        muted: "var(--text-muted)",
        brand: {
          DEFAULT: "var(--brand)",
          strong: "var(--brand-strong)",
        },
        info: "var(--info)",
        success: "var(--success)",
        warn: "var(--warn)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
