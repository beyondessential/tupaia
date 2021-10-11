// mock implementation of `yargs`, because `script.js` within `@tupaia/utils` uses it but that
// breaks storybook
module.exports = {
  strict: () => {},
};
