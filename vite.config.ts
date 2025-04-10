
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Set base dynamically based on the command
  const base = command === "serve" ? "/" : "/static";

  return {
    server: {
      host: "::",    // Allows access from any network interface
      port: 8080,    // Development server port
    },
    plugins: [
      react(),       // React plugin with SWC for faster compilation
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),  // Alias for src directory
      },
    },
    define: {
      // Expose environment variables to the client-side
      // Use process.env with fallback for compatibility
      "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || "https://pdf-buddy-1016285216432.us-central1.run.app"),
      "import.meta.env.PROD": mode === 'production',
    },
    base,  // Use the dynamically set base
  };
});
