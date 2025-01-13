import { compareAsc, compareDesc } from '../compare';

const compareAscTestData = [
  ['string < string', ['a', 'b'], -1],
  ['string = string', ['a', 'a'], 0],
  ['substring < string', ['a', 'aa'], -1],
  ['different case, different letters', ['A', 'b'], -1],
  ['different case, same letters', ['a', 'A'], -1],
  ['number < number', [0, 1], -1],
  ['number = number', [1, 1], 0],
  ['same starting digit', [1, 10], -1],
  ['string and number', [1000, 'a'], -1],
  ['undefined < string', [undefined, 'a'], -1],
  ['undefined < number', [undefined, 1], -1],
  ['undefined = number', [undefined, undefined], 0],
];

describe('compareAsc()', () => {
  it.each(compareAscTestData)('%s', (_, [a, b], expected) => {
    expect(compareAsc(a, b)).toBe(expected);
    if (expected !== 0) {
      expect(compareAsc(b, a)).toBe(expected * -1);
    }
  });
});

describe('compareDesc()', () => {
  const compareDescTestData = compareAscTestData.map(testCase => {
    const descTestCase = [...testCase];
    // Reverse asc results for desc comparison
    descTestCase[2] = testCase[2] * -1;
    return descTestCase;
  });

  it.each(compareDescTestData)('%s', (_, [a, b], expected) => {
    expect(compareDesc(a, b)).toBe(expected);
    if (expected !== 0) {
      expect(compareDesc(b, a)).toBe(expected * -1);
    }
  });
});
