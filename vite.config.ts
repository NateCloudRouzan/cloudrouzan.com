import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "barbuddy-recipes-a": ["src/barbuddy/data/recipes-a.json"],
          "barbuddy-recipes-b": ["src/barbuddy/data/recipes-b.json"],
        },
      },
      input: {
        main: "index.html",
        barbuddy: "BarBuddy/index.html",
        wineAdvent: "WineAdvent/index.html",
        chumani: "chumani/index.html",
      },
    },
  },
});
