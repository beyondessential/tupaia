/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import analyze from 'rollup-plugin-analyzer';
import babel from '@rollup/plugin-babel';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import svgr from '@svgr/rollup';
import url from 'rollup-plugin-url';
import pkg from './package.json';

const plugins = [
  builtins(),
  external(),
  json({
    compact: true,
  }),
  url(),
  svgr(),
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
  /date-fns/,
];

export default [
  {
    input: 'src/library.js',
    output: [
      { file: 'lib/index.js', format: 'cjs', plugins: [] },
      { file: 'lib/index.esm.js', format: 'esm', plugins: [] },
    ],
    plugins: [...plugins, del({ targets: ['lib'] })],
    external: externals,
  },
];
