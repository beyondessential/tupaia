import { NO_DATA_AVAILABLE } from '../constants';

export const multiplyValues = (multiplicand, multiplier) => {
  if (multiplicand === undefined || multiplier === undefined) {
    return NO_DATA_AVAILABLE;
  }

  return multiplicand * multiplier;
};
