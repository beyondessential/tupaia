import { NO_DATA_AVAILABLE } from '/apiV1/dataBuilders/constants';

const FRACTION_TYPE_TO_FUNC = {
  percentage: result => result,
  per10k: result => result * 10000,
  per100k: result => result * 100000,
};

export const divideValues = (numerator, denominator, fractionType = 'percentage') => {
  const isNumeratorValid = numerator || numerator === 0;
  const isDenominatorValid = denominator && parseFloat(denominator) !== 0;

  if (!isNumeratorValid || !isDenominatorValid) {
    return NO_DATA_AVAILABLE;
  }
  const modifierFunc = FRACTION_TYPE_TO_FUNC[fractionType];

  return modifierFunc(numerator / denominator);
};
