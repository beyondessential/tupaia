/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class SyncCursorType extends DatabaseType {
  static databaseType = TYPES.SYNC_CURSOR;
}

export class SyncCursorModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return SyncCursorType;
  }
}
