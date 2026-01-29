import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {

  // Charger le .env pour accéder aux variables front
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      host: '0.0.0.0',       // Accessible par IP
      port: 5173,            // Port Vite standard
      strictPort: true,      // Garde ce port
    },

    plugins: [react()],

    define: {
      // Empêche les erreurs "process is not defined"
      'process.env': {
        API_BASE_URL: JSON.stringify(env.VITE_API_BASE_URL),
        GEMINI_API_KEY: JSON.stringify(env.VITE_GEMINI_API_KEY)
      }
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
