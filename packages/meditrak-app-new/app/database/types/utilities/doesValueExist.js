/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const doesValueExist = (collection, key, value) =>
  collection.reduce((found, item) => found || item[key] === value, false);
