import { capital as capitaliseFirstLetters } from 'case';

export const getCountryNameFromCode = countryCode => {
  // only require countrynames when the function is actually run, otherwise it breaks front end
  // builds as the top level export from utils/index.js means that it is loaded
  // TODO get better at only requiring used code from internal dependencies
  const { getName } = require('countrynames');
  if (countryCode === 'DL') {
    return 'Demo Land';
  }
  return capitaliseFirstLetters(getName(countryCode));
};
