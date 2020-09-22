/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { replaceValues } from '../replaceValues';

describe('replaceValues()', () => {
  it.each([
    ['{target}', null, '{target}'],
    ['{target}', undefined, '{target}'],
    ['{target}', {}, '{target}'],
  ])('empty replacement values', (target, replacements, expected) => {
    expect(replaceValues(target, replacements)).toBe(expected);
  });

  it('empty replacement values', () => {
    expect(replaceValues('{target}')).toBe('{target}');
  });

  it.each([
    ['no matching replacement value', '{target}', { other: 'replaced' }, '{target}'],
    ['string input', '{target}', { target: 'replaced' }, 'replaced'],
  ])('%s', (_, target, replacements, expected) => {
    expect(replaceValues(target, replacements)).toBe(expected);
  });

  describe('object input', () => {
    it.each([
      ['key replacement', { '{target}': 'value' }, { target: 'replaced' }, { replaced: 'value' }],
      ['value replacement', { key: '{target}' }, { target: 'replaced' }, { key: 'replaced' }],
      [
        'key and value replacement',
        { '{targetKey}': '{targetValue}' },
        { targetKey: 'replacedKey', targetValue: 'replacedValue' },
        { replacedKey: 'replacedValue' },
      ],
    ])('%s', (_, target, replacements, expected) => {
      expect(replaceValues(target, replacements)).toStrictEqual(expected);
    });
  });
});
