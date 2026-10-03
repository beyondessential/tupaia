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

  // Node-only modules imported (but never executed in the browser) by @electric-sql/pglite
  const datatrakExternals = [
    '@node-rs/argon2-wasm32-wasi',
    'fs/promises',
    'memfs/promises',
    'stream/promises',
  ];

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
          external: datatrakExternals,
        }),
      },
    },
    ...(isDatatrakWeb && {
      // The PGlite worker (datatrak-web/src/database/pglite.worker.ts) is bundled in its own
      // rollup pass, which doesn't inherit build.rollupOptions — so the externals must be
      // repeated here. ES format so PGlite's lazy dynamic imports of the externals stay lazy
      // (they only execute under Node); iife would try to inline them.
      worker: {
        format: 'es',
        rollupOptions: {
          external: datatrakExternals,
        },
      },
    }),
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
        // The ui component packages are source-only (no build step), so resolve them to their
        // TypeScript sources and let Vite compile them alongside the app
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
          'rand-token': path.resolve(__dirname, 'mock/moduleMock.js'),
          pg: path.resolve(__dirname, 'mock/pgMock.js'),
          'pg-pubsub': path.resolve(__dirname, 'mock/moduleMock.js'),
          '@node-rs/argon2': path.resolve(__dirname, 'mock/argon2ModuleMock.js'),
          // The PGlite wasm/data assets aren't reachable through the package's exports map, but
          // the worker (datatrak-web/src/database/pglite.worker.ts) imports them with `?url` so
          // they get hashed filenames and cache-safe references like every other bundled asset
          'pglite-dist': path.resolve(__dirname, 'node_modules/@electric-sql/pglite/dist'),
          // Pin PGlite to its ESM builds. The worker bundling pass otherwise resolves the
          // package's `require` condition, and the CJS builds reference Node globals
          // (`__filename`) that throw in a browser worker, killing the database at startup.
          // Order matters: the more specific subpath must come before the package root.
          '@electric-sql/pglite/worker': path.resolve(
            __dirname,
            'node_modules/@electric-sql/pglite/dist/worker/index.js',
          ),
          '@electric-sql/pglite': path.resolve(
            __dirname,
            'node_modules/@electric-sql/pglite/dist/index.js',
          ),
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
