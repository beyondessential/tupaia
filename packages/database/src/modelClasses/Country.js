/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class CountryType extends DatabaseType {
  static databaseType = TYPES.COUNTRY;

  // TODO move meditrak-server specific things back to models in meditrak-server that extend these,
  // once https://github.com/beyondessential/tupaia/pull/417 makes it into dev
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
