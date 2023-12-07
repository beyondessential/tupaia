/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const arrayWithIdsToObject = arrayWithIds => {
  const returnObject = {};
  arrayWithIds.forEach(object => {
    returnObject[object.id] = object;
  });
  return returnObject;
};
