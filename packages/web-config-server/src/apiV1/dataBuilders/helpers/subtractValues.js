import { NO_DATA_AVAILABLE } from '../constants';

export const subtractValues = (minuend, subtrahend) => {
  const isMinuendValid = minuend || minuend === 0;
  const isSubtrahendValid = subtrahend || subtrahend === 0;

  if (!isMinuendValid || !isSubtrahendValid) {
    return NO_DATA_AVAILABLE;
  }

  return minuend - subtrahend;
};
