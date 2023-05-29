import { defineConfig } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // ViteEjsPlugin is used to allow the use of EJS templates in the index.html file, for analytics scripts etc
  plugins: [ViteEjsPlugin(), react()],
  server: {
    port: 8088,
    open: true,
  },
  envPrefix: 'REACT_APP_', // to allow any existing REACT_APP_ env variables to be used;
  resolve: {
    preserveSymlinks: true, // this is the fix!
  },
});
