/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 **/
import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;
}

export class DataSourceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DataSourceType;
  }
}
