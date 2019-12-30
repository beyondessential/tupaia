/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { DatabaseModel } from '../DatabaseModel';
import { TYPES } from '..';

class DhisSyncLogType extends DatabaseType {
  static databaseType = TYPES.DHIS_SYNC_LOG;
}

export class DhisSyncLogModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DhisSyncLogType;
  }
}
