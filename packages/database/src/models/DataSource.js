/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;
}

export class DataSourceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DataSourceType;
  }
}
