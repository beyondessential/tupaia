import { expect } from 'chai';

import { divideValues } from '/apiV1/dataBuilders/helpers/divideValues';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

describe('divideValues()', () => {
  it('numerator: defined, denominator: defined', () => {
    expect(divideValues(1, 2)).to.equal(0.5);
    expect(divideValues(2, 2)).to.equal(1);
  });

  it('numerator: not defined, denominator: any', () => {
    expect(divideValues()).to.equal(NO_DATA_AVAILABLE);
    expect(divideValues(undefined)).to.equal(NO_DATA_AVAILABLE);
    expect(divideValues(undefined, 2)).to.equal(NO_DATA_AVAILABLE);
    expect(divideValues(null)).to.equal(NO_DATA_AVAILABLE);
    expect(divideValues(null, 2)).to.equal(NO_DATA_AVAILABLE);
  });

  it('numerator: 0, denominator: defined not 0', () => {
    expect(divideValues(0, 1)).to.equal(0);
  });

  it('numerator: defined, denominator: not defined', () => {
    expect(divideValues(1)).to.equal(NO_DATA_AVAILABLE);
    expect(divideValues(1, undefined)).to.equal(NO_DATA_AVAILABLE);
    expect(divideValues(1, null)).to.equal(NO_DATA_AVAILABLE);
  });

  it('numerator: defined, denominator: 0', () => {
    expect(divideValues(1, 0)).to.equal(NO_DATA_AVAILABLE);
  });
});
