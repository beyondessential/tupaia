// a mock module for replacing modules in other packages, such as `yargs` within `@tupaia/utils`,
// that breaks storybook
module.exports = {
  strict: () => {},
};
