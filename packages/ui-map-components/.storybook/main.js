// import the build chain webpack config and merge it with storybook config
module.exports = {
  stories: ['../stories/**/*.stories.js'],
  addons: ['@storybook/addon-essentials'],
  typescript: {
    reactDocgen: 'react-docgen-typescript-plugin',
  },
};
