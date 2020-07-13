/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const fs = require('fs');

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('task', {
    /**
     * Required by `@cypress/snapshot` - `useRelativeSnapshots` config
     *
     * @see https://www.npmjs.com/package/@cypress/snapshot
     */
    readFileMaybe(filename) {
      return fs.existsSync(filename) ? fs.readFileSync(filename, 'utf8') : null;
    },
  });
};
