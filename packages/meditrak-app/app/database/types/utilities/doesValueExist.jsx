export const doesValueExist = (collection, key, value) =>
  collection.reduce((found, item) => found || item[key] === value, false);
