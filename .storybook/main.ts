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
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  core: {
    builder: '@storybook/builder-vite',
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
          http: path.resolve(__dirname, '../mock/moduleMock.js'),
          winston: path.resolve(__dirname, '../mock/moduleMock.js'),
          jsonwebtoken: path.resolve(__dirname, '../mock/moduleMock.js'),
          'node-fetch': path.resolve(__dirname, '../mock/moduleMock.js'),
          // This is a workaround for us using react-16 in the monorepo
          '@storybook/react-dom-shim': '@storybook/react-dom-shim/dist/react-16',
          'pg-pubsub': path.resolve(__dirname, '../mock/moduleMock.js'),
          '@node-rs/argon2': path.resolve(__dirname, '../mock/argon2ModuleMock.js'),
        },
      },
    });
  },
};
export default config;
