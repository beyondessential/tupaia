/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { replaceValues } from '../replaceValues';

describe('replaceValues()', () => {
  it('empty replacement values', () => {
    expect(replaceValues('{target}')).to.equal('{target}');
    expect(replaceValues('{target}', null)).to.equal('{target}');
    expect(replaceValues('{target}', undefined)).to.equal('{target}');
    expect(replaceValues('{target}', {})).to.equal('{target}');
  });

  it('no matching replacement value', () => {
    expect(replaceValues('{target}', { other: 'replaced' })).to.equal('{target}');
  });

  it('string input', () => {
    expect(replaceValues('{target}', { target: 'replaced' })).to.equal('replaced');
  });

  describe('object input', () => {
    it('key replacement', () => {
      expect(replaceValues({ '{target}': 'value' }, { target: 'replaced' })).to.deep.equal({
        replaced: 'value',
      });
    });

    it('value replacement', () => {
      expect(replaceValues({ key: '{target}' }, { target: 'replaced' })).to.deep.equal({
        key: 'replaced',
      });
    });

    it('key and value replacement', () => {
      expect(
        replaceValues(
          { '{targetKey}': '{targetValue}' },
          { targetKey: 'replacedKey', targetValue: 'replacedValue' },
        ),
      ).to.deep.equal({ replacedKey: 'replacedValue' });
    });
  });
});
