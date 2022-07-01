/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

const SERVICE_TYPES = {
  KOBO: 'kobo',
};

class DataServiceSyncGroupType extends DatabaseType {
  static databaseType = TYPES.DATA_SERVICE_SYNC_GROUP;
}

export class DataServiceSyncGroupModel extends DatabaseModel {
  SERVICE_TYPES = SERVICE_TYPES;

  get DatabaseTypeClass() {
    return DataServiceSyncGroupType;
  }
}
