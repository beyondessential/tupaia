// mock implementation of a module to stub out dependencies, because certain modules in `@tupaia/utils` break cypress
module.exports = {
  strict: () => {},
};
