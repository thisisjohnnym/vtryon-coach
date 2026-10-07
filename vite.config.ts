import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Native file events do not reach this project path, so poll instead.
    watch: { usePolling: true, interval: 300 },
  },
});
