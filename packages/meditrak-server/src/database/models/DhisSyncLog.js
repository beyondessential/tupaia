/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class DhisSyncLogType extends DatabaseType {
  static databaseType = TYPES.DHIS_SYNC_LOG;
}

export class DhisSyncLogModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DhisSyncLogType;
  }
}
