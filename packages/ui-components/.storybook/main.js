// import the build chain webpack config and merge it with storybook config
const custom = require('../webpack.config.js');

module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-links',
    '@storybook/addon-backgrounds',
    '@storybook/addon-storysource',
    '@storybook/addon-docs',
  ],
};
