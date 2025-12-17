import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import path from "path";
import dotenv from "dotenv";

// Load ROOT .env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // 👇 Expose env vars to import.meta.env
  define: {
    "import.meta.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_CLERK_PUBLISHABLE_KEY
    ),
    "import.meta.env.VITE_SENTRY_DSN": JSON.stringify(
      process.env.VITE_SENTRY_DSN
    ),
  },
});
