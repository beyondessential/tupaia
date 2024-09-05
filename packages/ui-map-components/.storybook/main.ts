/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import path, { join, dirname } from 'path';
import type { StorybookConfig } from '@storybook/react-vite';
/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, 'package.json')));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [getAbsolutePath('@storybook/addon-essentials')],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  core: {
    builder: '@storybook/builder-vite',
  },
  viteFinal: async (config, { configType }) => {
    // Merge custom configuration into the default config
    const { mergeConfig, loadEnv } = await import('vite');
    // Load the environment variables, whether or not they are prefixed with REACT_APP_
    const env = loadEnv(configType || 'DEVELOPMENT', process.cwd(), ['REACT_APP_', '']);

    return mergeConfig(config, {
      define: {
        'process.env': env,
      },
      resolve: {
        preserveSymlinks: true, // use the yarn workspace symlinks
        alias: {
          http: path.resolve(__dirname, 'moduleMock.js'),
          winston: path.resolve(__dirname, 'moduleMock.js'),
          jsonwebtoken: path.resolve(__dirname, 'moduleMock.js'),
          'node-fetch': path.resolve(__dirname, 'moduleMock.js'),
          // This is a workaround for us using react-16 in the monorepo
          '@storybook/react-dom-shim': '@storybook/react-dom-shim/dist/react-16',
        },
      },
    });
  },
};
export default config;
