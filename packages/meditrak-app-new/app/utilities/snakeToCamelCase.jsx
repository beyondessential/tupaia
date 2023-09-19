/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const snakeToCamelCase = (string, shouldUpperCaseFirstLetter) => {
  let newString = string;
  if (shouldUpperCaseFirstLetter) newString = newString.charAt(0).toUpperCase() + string.slice(1);
  return newString.replace(/(_\w)/g, substring => substring[1].toUpperCase()); // Convert _x to X
};
