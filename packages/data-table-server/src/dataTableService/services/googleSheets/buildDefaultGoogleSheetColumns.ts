/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

const ALPHABET_LENGTH = 26;

/**
 * Builds default columns of a google sheet based on the rows from the sheet
 *
 * Google sheets columns follow the following pattern:
 *   A-Z, AA-ZZ, etc.
 */
export const buildDefaultGoogleSheetColumns = (rows: unknown[][]) => {
  const longestRowLength = rows.reduce(
    (longest, row) => (row.length > longest ? row.length : longest),
    0,
  );

  const columns: string[] = [];

  for (let i = 0; i < longestRowLength; i++) {
    const alphabetIndex = i % ALPHABET_LENGTH;
    const alphabetChar = String.fromCharCode(65 + alphabetIndex); // 65 is ascii for A
    const numberOfCharRepeats = Math.floor(i / ALPHABET_LENGTH) + 1;
    const column = alphabetChar.repeat(numberOfCharRepeats);
    columns.push(column);
  }

  return columns;
};
