/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class MeditrakSyncQueueType extends DatabaseType {
  static databaseType = TYPES.MEDITRAK_SYNC_QUEUE;
}

export class MeditrakSyncQueueModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MeditrakSyncQueueType;
  }
}
