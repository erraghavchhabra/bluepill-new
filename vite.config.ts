// import { defineConfig, loadEnv } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd());
//   const publicUrl = env.VITE_PUBLIC_URL || '';
//   const port = env.VITE_PORT || 3000;
//   const domain = env.VITE_DOMAIN || 'sim.blue-pill.ai';

//   return {
//     base: `${publicUrl}/`,
//     resolve: {
//       alias: {
//         "@": path.resolve(__dirname, "src"),
//       },
//     },
//     plugins: [react()],
//     optimizeDeps: {
//       exclude: ['lucide-react'],
//     },
//     server: {
//       host: true,
//       port: 4000,
//       hmr: {
//         host: 'dev.blue-pill.ai',
//         port: 4001,
//         protocol: 'ws',
//         clientPort: 4001,
//       },
//     },
//   };
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    port: 4000,
    hmr: {
      host: 'sim.blue-pill.ai',
      port: 5005,
      protocol: 'ai',
      clientPort: 5005,
    },
  },
});

