/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { DatabaseModel } from '../DatabaseModel';
import { TYPES } from '..';

class CountryType extends DatabaseType {
  static databaseType = TYPES.COUNTRY;

  static meditrakConfig = {
    minAppVersion: '0.0.1',
  };

  async geographicalAreas() {
    return this.otherModels.geographicalArea.find({ country_id: this.id });
  }
}

export class CountryModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return CountryType;
  }
}
