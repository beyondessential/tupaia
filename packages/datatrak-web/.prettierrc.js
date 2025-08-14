const baseConfig = require('./../../.prettierrc.js');

module.exports = {
  ...baseConfig,
  overrides: [
    {
      files: ['apple-app-site-association'],
      options: { parser: 'json' },
    },
  ],
};
