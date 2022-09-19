/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { DatabaseModel } from '../DatabaseModel';

export class DataElementDataServiceType extends DatabaseType {
  static databaseType = TYPES.DATA_ELEMENT_DATA_SERVICE;
}

export class DataElementDataServiceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DataElementDataServiceType;
  }
}
