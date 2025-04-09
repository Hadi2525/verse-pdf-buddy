import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",    // Allows access from any network interface
    port: 8080,    // Development server port
  },
  plugins: [
    react(),       // React plugin with SWC for faster compilation
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),  // Alias for src directory
    },
  },
  define: {
    // Expose environment variables to the client-side
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  },
  // Optional: Add base configuration if needed for deployment
  base: '/',  // Default base path, adjust if deploying to a subdirectory
});