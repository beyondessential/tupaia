/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import Diff from 'diff';

const COLOR_CODES = {
  green: [32, 89],
  red: [31, 89],
  grey: [30, 89],
};

export const diff = (oldText: string, newText: string) => {
  const diff = Diff.diffLines(oldText, newText);

  if (diff.length === 0) {
    // No difference
    return false;
  }

  const diffText = diff.map(part => {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    const colorCodes = COLOR_CODES[color];
    return `\x1b[${colorCodes[0]}m${part.value}\x1b[${colorCodes[1]}m`;
  });

  console.log(diffText);

  return true;
};
