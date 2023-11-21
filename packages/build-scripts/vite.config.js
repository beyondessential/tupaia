/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { defineConfig, loadEnv } from 'vite';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');

  const baseConfig = {
    build: {
      rollupOptions: {
        output: {
          manualChunks: function manualChunks(id) {
            if (id.includes('lodash')) return 'lodash';
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
      open: true,
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
