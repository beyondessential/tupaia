/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class SyncGroupLogType extends DatabaseType {
  static databaseType = TYPES.SYNC_GROUP_LOG;
}

export class SyncGroupLogModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SyncGroupLogType;
  }
}
