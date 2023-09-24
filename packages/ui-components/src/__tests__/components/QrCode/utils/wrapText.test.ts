/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { wrapText } from '../../../../components/QrCode/utils/wrapText';

describe('wrapText', () => {
  const TEST_CASES: [string, string[]][] = [
    ['Short', ['Short']],
    ['The quick brown fox jumps over the lazy dog', ['The quick', 'brown fox', 'jumps over']],
    ['Short Looooooooooonnnnggg', ['Short', 'Looooooooooo', 'nnnnggg']],
    ['Looooooooooonnnnggg Short', ['Looooooooooo', 'nnnnggg', 'Short']],
    [
      'VeryLooooooooooonnnngggGGGaaaGGGGHHHhhhhhhhhhhh',
      ['VeryLooooooo', 'oooonnnngggG', 'GGaaaGGGGHHH'],
    ],
  ];

  test.each(TEST_CASES)('runs', (input, expected) => {
    expect(wrapText(input)).toEqual(expected);
  });
});
