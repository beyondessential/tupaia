/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class DataServiceEntityType extends DatabaseType {
  static databaseType = TYPES.DATA_SERVICE_ENTITY;
}

export class DataServiceEntityModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DataServiceEntityType;
  }
}
