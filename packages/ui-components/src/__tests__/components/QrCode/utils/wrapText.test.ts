import { wrapText } from '../../../../components/QrCode/utils/wrapText';

describe('wrapText', () => {
  const TEST_CASES: [string, string[]][] = [
    ['Short', ['Short']],
    ['The quick brown fox jumps over the lazy dog', ['The quick', 'brown fox', 'jumps over']],
    ['Short Looooooooooonnnnggg', ['Short', 'Looooooooooon', 'nnnggg']],
    ['Looooooooooonnnnggg Short', ['Looooooooooon', 'nnnggg Short']],
    [
      'VeryLooooooooooonnnngggGGGaaaGGGGHHHhhhhhhhhhhh',
      ['VeryLoooooooo', 'ooonnnngggGGG', 'aaaGGGGHHHhhh'],
    ],
  ];

  test.each(TEST_CASES)('runs', (input, expected) => {
    expect(wrapText(input)).toEqual(expected);
  });
});
