import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <-- Thêm dòng này

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Kích hoạt Tailwind v4
  ],
  server: {
    port: 3001,
    strictPort: true,
  },
});
