#!/usr/bin/env node

const { exec } = require("child_process");

/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const package = process.argv[2];

if (!package) {
  console.log(`
    Usage: dependencies PACKAGE
    E.g. node dependencies.js @tupaia/admin-panel 
  `);
  process.exit(1);
}

exec(`yarn --silent lerna la --scope ${package} --include-dependencies --json --loglevel error`, (error, stdout, stderr) => {
  if (error) throw error;
  if (stderr) throw new Error(stderr);

  const deps = JSON.parse(stdout);

  const paths = deps
    .filter(dep => dep.name !== package)
    .map(dep => dep.location);

  console.log(paths.join('\n'));
});