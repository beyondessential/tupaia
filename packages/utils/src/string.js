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

export const stripFromEnds = (originalString, toStripOff = '') =>
  originalString.replace(new RegExp(`(${toStripOff})`), '').trim();
