import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://cts.myvi.in:8443",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/Cpaas/api"),
      },
    },
  },
});
