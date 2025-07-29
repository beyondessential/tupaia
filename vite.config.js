import { defineConfig, loadEnv } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import viteCompression from 'vite-plugin-compression';
import react from '@vitejs/plugin-react';
import path from 'path';
import dns from 'dns';

// work around to open browser in localhost https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load the environment variables, whether or not they are prefixed with REACT_APP_
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', '']);

  const baseConfig = {
    build: {
      rollupOptions: {
        output: {
          manualChunks: function manualChunks(id) {
            if (id.includes('ace-builds')) return 'ace';
            if (id.includes('react-ace')) return 'reactAce';
            if (id.includes('jsoneditor')) return 'jsonEditor';
            if (id.includes('jszip')) return 'jszip';
            if (id.includes('icons')) return 'muiIcons';
            if (id.includes('moment-timezone')) return 'momentTimezone';
            if (id.includes('qrcode')) return 'qrcode';
            if (id.includes('types')) return 'tupaiaTypes';
            if (id.includes('xlsx')) return 'xlsx';
          },
        },
      },
    },
    plugins: [
      ViteEjsPlugin(), // Enables use of EJS templates in the index.html file, for analytics scripts etc
      viteCompression(),
      react({
        jsxRuntime: 'classic',
      }),
    ],
    define: {
      'process.env': env,
    },
    server: {
      open: true,
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      },
    },
    envPrefix: 'REACT_APP_', // to allow any existing REACT_APP_ env variables to be used;
    resolve: {
      preserveSymlinks: true, // use the yarn workspace symlinks
      dedupe: ['@material-ui/core', 'react', 'react-dom', 'styled-components', 'react-router-dom'], // deduplicate these packages to avoid duplicate copies of them in the bundle, which might happen and cause errors with ui component packages
      alias: {
        http: path.resolve(__dirname, 'moduleMock.js'),
        winston: path.resolve(__dirname, 'moduleMock.js'),
        jsonwebtoken: path.resolve(__dirname, 'moduleMock.js'),
        'node-fetch': path.resolve(__dirname, 'moduleMock.js'),
      },
    },
  };

  // Dev specific config. This is because `define.global` breaks the build
  if (command === 'serve') {
    return {
      ...baseConfig,
      define: {
        ...baseConfig.define,
        global: {},
      },
      resolve: {
        ...baseConfig.resolve,
        alias: {
          ...baseConfig.resolve.alias,
          '@tupaia/admin-panel': path.resolve(__dirname, './packages/admin-panel/src/library.js'),
          // this is to allow for hot reloading in dev
          '@tupaia/ui-chart-components': path.resolve(
            __dirname,
            './packages/ui-chart-components/src/index.ts',
          ),
          '@tupaia/ui-map-components': path.resolve(
            __dirname,
            './packages/ui-map-components/src/index.ts',
          ),
          '@tupaia/ui-components': path.resolve(__dirname, './packages/ui-components/src/index.ts'),
        },
      },
    };
  }
  return baseConfig;
});
