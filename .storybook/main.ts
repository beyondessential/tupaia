import fs from 'fs';
import path, { join } from 'path';
import type { StorybookConfig } from '@storybook/react-vite';

const getStoriesDir = () => {
  const currentDir = process.cwd();
  return join(currentDir, 'stories/**/*.stories.@(js|jsx|ts|tsx)');
};

const getStaticDir = () => {
  const currentDir = process.cwd();
  const publicPath = join(currentDir, 'public');

  if (!fs.existsSync(publicPath)) return [];
  return [publicPath];
};

const config: StorybookConfig = {
  stories: [getStoriesDir()],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  staticDirs: getStaticDir(),
  viteFinal: async (config, { configType }) => {
    // Merge custom configuration into the default config
    const { mergeConfig, loadEnv } = await import('vite');
    // Load the environment variables, whether or not they are prefixed with REACT_APP_
    const env = loadEnv(configType || 'DEVELOPMENT', process.cwd(), ['REACT_APP_', '']);

    return mergeConfig(config, {
      define: {
        'process.env': env,
      },
      server: {
        watch: {
          // Ignore the .env files because for some reason vite is detecting changes in them and restarting the server multiple times
          ignored: '**/.env*',
        },
      },
      resolve: {
        preserveSymlinks: true, // use the yarn workspace symlinks
        alias: {
          // The ui component packages are source-only (no build step), so resolve them to their
          // TypeScript sources and let Vite compile them alongside the stories
          '@tupaia/ui-chart-components': path.resolve(
            import.meta.dirname,
            '../packages/ui-chart-components/src/index.ts',
          ),
          '@tupaia/ui-map-components': path.resolve(
            import.meta.dirname,
            '../packages/ui-map-components/src/index.ts',
          ),
          '@tupaia/ui-components': path.resolve(
            import.meta.dirname,
            '../packages/ui-components/src/index.ts',
          ),
          http: path.resolve(import.meta.dirname, '../mock/moduleMock.js'),
          winston: path.resolve(import.meta.dirname, '../mock/moduleMock.js'),
          jsonwebtoken: path.resolve(import.meta.dirname, '../mock/moduleMock.js'),
          'node-fetch': path.resolve(import.meta.dirname, '../mock/moduleMock.js'),
          'pg-pubsub': path.resolve(import.meta.dirname, '../mock/moduleMock.js'),
          '@node-rs/argon2': path.resolve(import.meta.dirname, '../mock/argon2ModuleMock.js'),
        },
      },
    });
  },
};
export default config;
