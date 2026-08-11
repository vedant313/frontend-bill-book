import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, any request to /api is forwarded to the backend
// running on http://localhost:4000 (see ../backend).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
