import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

export const divideValues = (numerator, denominator, fractionType) => {
  const isNumeratorValid = numerator || numerator === 0;
  const isDenominatorValid = denominator && parseFloat(denominator) !== 0;

  if (!isNumeratorValid || !isDenominatorValid) {
    return NO_DATA_AVAILABLE;
  }

  let result = numerator / denominator;
  if (fractionType === 'per10k') {
    result *= 10000;
  }
  return result;
};
