/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

export const DATA_SOURCE_SERVICE_TYPES = ['dhis'];

class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;
}

export class DataSourceModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DataSourceType;
  }

  isDeletableViaApi = true;
}
