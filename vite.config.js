import replace from '@rollup/plugin-replace';
import react from '@vitejs/plugin-react';
import dns from 'node:dns';
import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import commonjs from 'vite-plugin-commonjs';
import viteCompression from 'vite-plugin-compression';
import { ViteEjsPlugin } from 'vite-plugin-ejs';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// work around to open browser in localhost https://vitejs.dev/config/server-options.html#server-host
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load the environment variables, whether or not they are prefixed with REACT_APP_
  const env = loadEnv(mode, process.cwd(), ['REACT_APP_', '']);
  const DATATRAK_WEB_NAME = '@tupaia/datatrak-web';
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
  const packageName = packageJson.name;

  // Inject package version into env (e.g. datatrak-web uses it for sync version compatibility)
  env.REACT_APP_VERSION = packageJson.version;


  const isDatatrakWeb = packageName === DATATRAK_WEB_NAME;

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
        ...(isDatatrakWeb && {
          external: [
            '@node-rs/argon2-wasm32-wasi',
            'fs/promises',
            'memfs/promises',
            'stream/promises',
          ],
        }),
      },
    },
    plugins: [
      ViteEjsPlugin(), // Enables use of EJS templates in the index.html file, for analytics scripts etc
      viteCompression(),
      react({ jsxRuntime: 'classic' }),
      ...(isDatatrakWeb
        ? [
            nodePolyfills({
              protocolImports: true,
              overrides: {
                fs: 'memfs',
              },
            }),
            commonjs(),
            // Replace process.env with actual values instead of using define, because define
            // also replaces process.env in external node_modules, causing issues with knex
            replace({
              'process.env': JSON.stringify(env),
              include: 'src/**/*',
              exclude: 'node_modules/**',
              preventAssignment: false,
            }),
          ]
        : []),
    ],
    define: {
      ...(isDatatrakWeb
        ? { __dirname: JSON.stringify('/') }
        : { 'process.env': env }),
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
      ...(isDatatrakWeb && { conditions: ['browser'] }),
      preserveSymlinks: true, // use the yarn workspace symlinks
      dedupe: ['@material-ui/core', 'react', 'react-dom', 'styled-components', 'react-router-dom'], // deduplicate these packages to avoid duplicate copies of them in the bundle, which might happen and cause errors with ui component packages
      alias: {
        http: path.resolve(__dirname, 'mock/moduleMock.js'),
        winston: path.resolve(__dirname, 'mock/winston.js'),
        jsonwebtoken: path.resolve(__dirname, 'mock/moduleMock.js'),
        'node-fetch': path.resolve(__dirname, 'mock/moduleMock.js'),
        ...(isDatatrakWeb && {
          'rand-token': path.resolve(__dirname, 'mock/moduleMock.js'),
          pg: path.resolve(__dirname, 'mock/pgMock.js'),
          'pg-pubsub': path.resolve(__dirname, 'mock/moduleMock.js'),
          '@node-rs/argon2': path.resolve(__dirname, 'mock/argon2ModuleMock.js'),
        }),
      },
    },
    ...(isDatatrakWeb && {
      optimizeDeps: {
        exclude: ['@electric-sql/pglite'],
      },
    }),
  };

  // Dev specific config. This is because `define.global` breaks the build
  if (command === 'serve') {
    return {
      ...baseConfig,
      define: { ...baseConfig.define, global: {} },
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
          ...(isDatatrakWeb && {
            '@tupaia/database': path.resolve(__dirname, './packages/database/src/browser/index.js'),
            '@tupaia/sync': path.resolve(__dirname, './packages/sync/src/index.ts'),
            '@tupaia/constants': path.resolve(__dirname, './packages/constants/src/index.ts'),
            '@tupaia/tsutils': path.resolve(__dirname, './packages/tsutils/src/index.ts'),
            '@tupaia/access-policy': path.resolve(__dirname, './packages/access-policy/src/index.js'),
          }),
        },
      },
    };
  }
  return baseConfig;
});
