import { reduceToDictionary } from '@tupaia/utils';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class CountryRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.COUNTRY;

  async geographicalAreas() {
    return this.otherModels.geographicalArea.find({ country_id: this.id });
  }
}

export class CountryModel extends DatabaseModel {
  static syncDirection = SyncDirections.PULL_FROM_CENTRAL;

  get DatabaseRecordClass() {
    return CountryRecord;
  }

  async getCountryCodeById(countryIds) {
    const countries = await this.findManyById(countryIds);
    return reduceToDictionary(countries, 'id', 'code');
  }

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
