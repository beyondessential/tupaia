/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class MeditrakSyncQueueType extends DatabaseType {
  static databaseType = TYPES.MEDITRAK_SYNC_QUEUE;
}

export class MeditrakSyncQueueModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MeditrakSyncQueueType;
  }
}
