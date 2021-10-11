/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import fg from 'fast-glob';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import analyze from 'rollup-plugin-analyzer';
import babel from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import url from 'rollup-plugin-url';
import pkg from './package.json';

const externalWatch = glob => {
  return {
    name: 'watch-external',
    async buildStart() {
      const files = await fg(glob);
      for (const file of files) {
        this.addWatchFile(file);
      }
    },
  };
};

const plugins = [
  builtins(),
  external(),
  json({
    compact: true,
  }),
  url(),
  babel({
    exclude: 'node_modules/**',
    configFile: './.babelrc.js',
    babelHelpers: 'bundled',
  }),
  commonjs(),
  analyze({ summaryOnly: true }),
];

// https://stackoverflow.com/questions/63373804/rollup-watch-include-directory
const externals = [
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  /@material-ui/,
  /date-fns/,
];

export default [
  {
    input: pkg.source,
    output: [
      { file: pkg.main, format: 'cjs', plugins: [terser()] },
      { file: pkg.module, format: 'esm', plugins: [terser()] },
    ],
    plugins: [...plugins, del({ targets: ['dist'] })],
    external: externals,
  },
  {
    input: 'src/components/Chart/index.js',
    output: [
      { file: 'lib/chart/index.js', format: 'cjs', plugins: [terser()] },
      { file: 'lib/chart/index.esm.js', format: 'esm', plugins: [terser()] },
    ],
    plugins: [...plugins, del({ targets: ['lib/chart'] }), externalWatch('src/**/*')],
    external: externals,
  },
  {
    input: 'src/components/Map/index.js',
    output: [
      { file: 'lib/map/index.js', format: 'cjs', plugins: [terser()] },
      { file: 'lib/map/index.esm.js', format: 'esm', plugins: [terser()] },
    ],
    plugins: [...plugins, del({ targets: ['lib/map'] }), externalWatch('src/**/*')],
    external: externals,
  },
];
