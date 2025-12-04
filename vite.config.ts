import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to avoid TS error: Property 'cwd' does not exist on type 'Process'
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Stringify the API key to inject it into the code as a string
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Stringify the Base URL for proxy support
      'process.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL),
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});