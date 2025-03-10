import { CountryModel as CommonCountryModel } from '@tupaia/database';

export class CountryModel extends CommonCountryModel {
  meditrakConfig = {
    minAppVersion: '0.0.1',
  };
}
