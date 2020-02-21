import { capital as capitaliseFirstLetters } from 'case';

export const getCountryNameFromCode = countryCode => {
  // only require countrynames when the function is actually run, otherwise it breaks front end
  // builds as the top level export from utils/index.js means that it is loaded
  // TODO get better at only requiring used code from internal dependencies
  // https://github.com/beyondessential/tupaia-backlog/issues/115
  const { getName } = require('countrynames');
  if (countryCode === 'DL') {
    return 'Demo Land';
  }
  return capitaliseFirstLetters(getName(countryCode));
};
