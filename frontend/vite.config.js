import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3001,
    strictPort: true,
    // 👇 THÊM ĐOẠN NÀY: Cấu hình Proxy
    proxy: {
      "/api": {
        target: "http://localhost:8000", // Trỏ về Backend thật
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
