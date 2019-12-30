/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { DatabaseModel } from '../DatabaseModel';
import { TYPES } from '..';

class Ms1SyncQueueType extends DatabaseType {
  static databaseType = TYPES.MS1_SYNC_QUEUE;
}

export class Ms1SyncQueueModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return Ms1SyncQueueType;
  }
}
