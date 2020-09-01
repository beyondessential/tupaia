/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export function singularise(word) {
  // Check if the word ends as a plural
  const pluralEnding = ['ies', 's'].find(ending => word.endsWith(ending));

  // Take off any plural ending
  let singularWord = pluralEnding ? word.substring(0, word.length - pluralEnding.length) : word;

  // Add on a 'y' if it was 'ies'
  if (pluralEnding === 'ies') {
    singularWord += 'y';
  }

  return singularWord;
}

export const stripFromString = (originalString, toStripOff = '') =>
  originalString
    .replace(new RegExp(toStripOff), '') // strip toStripOff from anywhere in the string
    .replace(new RegExp(' {2,}'), ' ') // replace any double spaces left in middle of string with a single space
    .trim();

export const upperFirst = text => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
