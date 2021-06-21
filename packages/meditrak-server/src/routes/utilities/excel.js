/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { compareTwoStrings } from 'string-similarity';

import { ImportValidationError } from '@tupaia/utils';

// Attempts to find and extract a tab name from a list of tab names.
export const extractTabNameFromQuery = (tabName, requestedTabs) => {
  let closestMatch = '';
  for (const requestedTab of requestedTabs) {
    // To deal with the character limit in Excel tabs, the tab name may be just the start of
    // the option set name, so we check for partial matches
    if (
      requestedTab.startsWith(tabName) && // Test it at least partially matches &
      compareTwoStrings(requestedTab, tabName) > compareTwoStrings(closestMatch, tabName) // The existing match isn't closer
    ) {
      closestMatch = requestedTab;
    }
  }
  if (closestMatch.length === 0) {
    throw new ImportValidationError(
      `The tab ${tabName} was not listed as a survey name in the HTTP query`,
    );
  }
  return closestMatch;
};

export const splitStringOn = (string, splitCharacter) => {
  return string ? string.split(splitCharacter).map(segment => segment.trim()) : [];
};

export const splitStringOnFirstOccurrence = (string, splitCharacter) => {
  let [first, ...second] = string ? string.split(splitCharacter) : [];
  second = second.join(splitCharacter);
  const result = [first, second];
  return result.map(segment => segment.trim());
};

export const splitStringOnComma = string => splitStringOn(string, ',');

export const splitOnNewLinesOrCommas = string => {
  if (!string) return [];
  return string.includes('\n') ? splitStringOn(string, '\n') : splitStringOnComma(string);
};
