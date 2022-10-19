import { divideValues } from '/apiV1/dataBuilders/helpers/divideValues';
import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

describe('divideValues()', () => {
  it('numerator: defined, denominator: defined', () => {
    expect(divideValues(1, 2)).toBe(0.5);
    expect(divideValues(2, 2)).toBe(1);
  });

  it('numerator: not defined, denominator: any', () => {
    expect(divideValues()).toBe(NO_DATA_AVAILABLE);
    expect(divideValues(undefined)).toBe(NO_DATA_AVAILABLE);
    expect(divideValues(undefined, 2)).toBe(NO_DATA_AVAILABLE);
    expect(divideValues(null)).toBe(NO_DATA_AVAILABLE);
    expect(divideValues(null, 2)).toBe(NO_DATA_AVAILABLE);
  });

  it('numerator: 0, denominator: defined not 0', () => {
    expect(divideValues(0, 1)).toBe(0);
  });

  it('numerator: defined, denominator: not defined', () => {
    expect(divideValues(1)).toBe(NO_DATA_AVAILABLE);
    expect(divideValues(1, undefined)).toBe(NO_DATA_AVAILABLE);
    expect(divideValues(1, null)).toBe(NO_DATA_AVAILABLE);
  });

  it('numerator: defined, denominator: 0', () => {
    expect(divideValues(1, 0)).toBe(NO_DATA_AVAILABLE);
  });
});
