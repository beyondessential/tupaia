/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseType } from '../DatabaseType';
import { DatabaseModel } from '../DatabaseModel';
import { TYPES } from '..';

class MeditrakSyncQueueType extends DatabaseType {
  static databaseType = TYPES.MEDITRAK_SYNC_QUEUE;
}

export class MeditrakSyncQueueModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return MeditrakSyncQueueType;
  }
}
