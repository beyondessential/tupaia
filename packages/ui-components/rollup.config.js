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
import { nodeResolve } from '@rollup/plugin-node-resolve';
import external from 'rollup-plugin-peer-deps-external';
import del from 'rollup-plugin-delete';
import svg from 'rollup-plugin-svg';
import pkg from './package.json';

const plugins = [
  builtins(),
  nodeResolve(),
  external(),
  json({
    compact: true,
  }),
  svg(),
  babel({
    exclude: 'node_modules/**',
    configFile: './.babelrc.js',
  }),
  commonjs(),
  analyze({ summaryOnly: true }),
  del({ targets: ['dist'] }),
];

const externals = Object.keys(pkg.peerDependencies || {});

export default [
  {
    input: pkg.source,
    output: [
      { file: pkg.main, format: 'esm', plugins: [terser()] },
      { file: pkg.module, format: 'cjs', plugins: [terser()] },
    ],
    plugins,
    external: externals,
  },
];
