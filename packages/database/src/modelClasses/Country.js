/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { reduceToDictionary } from '@tupaia/utils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class CountryType extends DatabaseType {
  static databaseType = TYPES.COUNTRY;

  async geographicalAreas() {
    return this.otherModels.geographicalArea.find({ country_id: this.id });
  }
}

export class CountryModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return CountryType;
  }

  async getCountryCodeById(countryIds) {
    const countries = await this.findManyById(countryIds);
    return reduceToDictionary(countries, 'id', 'code');
  }
}
