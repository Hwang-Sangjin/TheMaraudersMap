import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import glsl from "vite-plugin-glsl";

// https://vite.dev/config/
export default defineConfig({
  theme: {
    extend: {
      colors: {
        marauder: {
          red: "#6e1b15",
          purple: "#431d2c",
        },
      },
    },
  },
  plugins: [react(), tailwindcss(), glsl()],
});
