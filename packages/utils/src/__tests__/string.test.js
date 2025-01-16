import { getArticle, upperFirst } from '../string';

describe('string utilities', () => {
  describe('upperFirst', () => {
    it.each([
      ['all lowercase', 'lowercase words', 'Lowercase words'],
      ['all uppercase', 'UPPERCASE WORDS', 'UPPERCASE WORDS'],
      ['mixed case - lowercase first', 'mIXed WOrdS', 'MIXed WOrdS'],
    ])('%s', (_, text, expected) => {
      expect(upperFirst(text)).toBe(expected);
    });
  });

  describe('getArticle', () => {
    const testData = [
      ['undefined', undefined, ''],
      ['null', null, ''],
      ['empty string', '', ''],
      ['a', 'alpha', 'an'],
      ['e', 'epsilon', 'an'],
      ['i', 'iota', 'an'],
      ['o', 'omikron', 'an'],
      ['u', 'utensil', 'an'],
      ['b', 'bet', 'a'],
      ['A', 'Alpha', 'an'],
    ];

    it.each(testData)('%s', (_, word, expected) => {
      expect(getArticle(word)).toBe(expected);
    });
  });
});
