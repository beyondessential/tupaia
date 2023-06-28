import { defineConfig, loadEnv } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  const baseConfig = {
    // ViteEjsPlugin is used to allow the use of EJS templates in the index.html file, for analytics scripts etc
    plugins: [
      ViteEjsPlugin(),
      react({
        jsxRuntime: 'classic',
      }),
    ],
    define: {
      'process.env': env,
    },
    server: {
      port: 8088,
      open: true,
    },
    envPrefix: 'REACT_APP_', // to allow any existing REACT_APP_ env variables to be used;
    resolve: {
      preserveSymlinks: true, // use the yarn workspace symlinks
      dedupe: ['@material-ui/core', 'react', 'react-dom', 'styled-components'], // deduplicate these packages to avoid duplicate copies of them in the bundle, which might happen and cause errors with ui component packages
      alias: {
        http: 'moduleMock.js',
        winston: 'moduleMock.js',
        jsonwebtoken: 'moduleMock.js',
        'node-fetch': 'moduleMock.js',
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
          // this is to allow for hot reloading in dev
          '@tupaia/ui-chart-components': path.resolve(
            __dirname,
            '../ui-chart-components/src/index.ts',
          ),
          '@tupaia/ui-map-components': path.resolve(__dirname, '../ui-map-components/src/index.ts'),
          '@tupaia/ui-components': path.resolve(__dirname, '../ui-components/src/index.ts'),
        },
      },
    };
  }
  return baseConfig;
});
