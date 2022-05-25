import { ValidationError, constructIsOneOf } from '@tupaia/utils';
import { splitStringOnComma } from '../../utilities';
import { isYesOrNo } from './utilities';

export const validateIsYesOrNo = value => {
  if (!isYesOrNo(value)) {
    throw new ValidationError('Value must be either Yes or No');
  }
  return true;
};

export const constructListItemsAreOneOf = validValues => listString => {
  const list = splitStringOnComma(listString);
  const itemValidator = constructIsOneOf(validValues);
  list.forEach(itemValidator);

  return true;
};
