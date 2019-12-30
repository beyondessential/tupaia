import { getName } from 'countrynames';
import { capital as capitaliseFirstLetters } from 'case';

export const getCountryNameFromCode = countryCode => {
  if (countryCode === 'DL') {
    return 'Demo Land';
  }
  return capitaliseFirstLetters(getName(countryCode));
};
