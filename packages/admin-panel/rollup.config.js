/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

/* eslint-disable import/no-extraneous-dependencies */
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import analyze from 'rollup-plugin-analyzer';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import pkg from './package.json';

const plugins = [
  builtins(),
  external(),
  json({
    compact: true,
  }),
  babel({
    exclude: 'node_modules/**',
    configFile: './.babelrc.js',
  }),
  commonjs(),
  analyze({ summaryOnly: true }),
];

// https://stackoverflow.com/questions/63373804/rollup-watch-include-directory
const externals = [
  ...Object.keys(pkg.devDependencies || {}),
  ...Object.keys(pkg.dependencies || {}),
  /@material-ui/,
];

export default [
  {
    input: 'src/library.js',
    output: [
      { file: 'lib/index.js', format: 'cjs', plugins: [terser()] },
      { file: 'lib/index.esm.js', format: 'esm', plugins: [terser()] },
    ],
    plugins: [...plugins, del({ targets: ['lib'] })],
    external: externals,
  },
];
