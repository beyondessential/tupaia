import { subMinutes } from 'date-fns';
import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const SYNC_READY_WINDOW_MINUTES = 5;

export class SyncQueuedDeviceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_QUEUED_DEVICE;
}

export class SyncQueuedDeviceModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SyncQueuedDeviceRecord;
  }

  getReadyDevicesWhereClause() {
    return {
      last_seen_time: {
        comparator: '>',
        comparisonValue: subMinutes(new Date(), SYNC_READY_WINDOW_MINUTES),
      },
    };
  }

  async getNextReadyDevice() {
    return this.findOne(this.getReadyDevicesWhereClause(), {
      sort: ['urgent DESC', 'last_synced_tick ASC'],
    });
  }

  async checkSyncRequest({ deviceId, urgent, lastSyncedTick }) {
    // first, update our own entry in the sync queue
    const queueRecord = await this.findById(deviceId);

    if (!queueRecord) {
      // new entry in sync queue
      await this.create({
        id: deviceId,
        last_seen_time: new Date(),
        urgent,
        last_synced_tick: lastSyncedTick,
      });
    } else {
      // update with most recent info
      // (always go with most urgent request - this way a user-requested urgent
      // sync won't be overwritten to non-urgent by a scheduled sync)
      await this.update(deviceId, {
        last_seen_time: new Date(),
        urgent,
        last_synced_tick: lastSyncedTick,
      });
    }

    // now check the queue and return the top device - if it's us, the handler will
    // start a sync (otherwise it'll get used in a "waiting behind device X" response
    return this.getNextReadyDevice();
  }
}
