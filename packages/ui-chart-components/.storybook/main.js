// import the build chain webpack config and merge it with storybook config
module.exports = {
  stories: ['../stories/**/*.stories.js', '../stories/**/*.stories.ts'],
  addons: ['@storybook/addon-essentials'],
};
