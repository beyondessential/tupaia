/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { replaceValues } from '../replaceValues';

describe('replaceValues()', () => {
  it('empty replacement values', () => {
    expect(replaceValues('{target}')).toBe('{target}');
    expect(replaceValues('{target}', null)).toBe('{target}');
    expect(replaceValues('{target}', undefined)).toBe('{target}');
    expect(replaceValues('{target}', {})).toBe('{target}');
  });

  it('no matching replacement value', () => {
    expect(replaceValues('{target}', { other: 'replaced' })).toBe('{target}');
  });

  it('string input', () => {
    expect(replaceValues('{target}', { target: 'replaced' })).toBe('replaced');
  });

  describe('object input', () => {
    it('key replacement', () => {
      expect(replaceValues({ '{target}': 'value' }, { target: 'replaced' })).toEqual({
        replaced: 'value',
      });
    });

    it('value replacement', () => {
      expect(replaceValues({ key: '{target}' }, { target: 'replaced' })).toEqual({
        key: 'replaced',
      });
    });

    it('key and value replacement', () => {
      expect(
        replaceValues(
          { '{targetKey}': '{targetValue}' },
          { targetKey: 'replacedKey', targetValue: 'replacedValue' },
        ),
      ).toEqual({ replacedKey: 'replacedValue' });
    });
  });
});
