import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SyncSessionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_SESSION;

  /**
   * Mark the sync session as started at a given tick
   * @param {*} tick 
   * @returns 
   */
  async markAsStartedAt(tick) {
    this.started_at_tick = tick;
    await this.save();
  }

  /**
   * Mark the sync session as errored with a given error
   * @param {*} error 
   */
  async markErrored(error) {
    const errors = this.errors || [];
    this.errors = [...errors, error];
    this.completedAt = new Date();
    await this.save();
  }
}

export class SyncSessionModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SyncSessionRecord;
  }

  /**
   * Mark the sync session as errored with a given error
   * @param {*} id 
   * @param {*} error 
   */
  async markSessionErrored(id, error) {
    const session = await this.findById(id);
    await session?.markErrored(error);
  }

  /**
   * Add debug info to a sync session
   * @param {*} id 
   * @param {*} info 
   */
  async addInfo(id, info) {
    const session = await this.findById(id);
    session.info = { ...session.info, ...info };
    await session.save();
  }
}
