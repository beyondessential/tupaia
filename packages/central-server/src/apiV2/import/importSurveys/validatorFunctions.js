import { ValidationError } from '@tupaia/utils';
import { isYesOrNo } from './utilities';

export const validateIsYesOrNo = value => {
  if (!isYesOrNo(value)) {
    throw new ValidationError('Value must be either Yes or No');
  }
  return true;
};
