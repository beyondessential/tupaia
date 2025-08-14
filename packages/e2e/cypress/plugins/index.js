const cypressDotenv = require('cypress-dotenv');
const fs = require('fs');

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

  return cypressDotenv(config);
};
