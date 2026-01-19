/**
 * @typedef {import('@tupaia/types').SyncSession} SyncSession
 * @typedef {import('@tupaia/types').SyncSessionInfo} SyncSessionInfo
 */

import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SyncSessionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_SESSION;
}

export class SyncSessionModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SyncSessionRecord;
  }

  /**
   * Mark the sync session as errored with a given error
   * @param {SyncSession['id']} id
   * @param {string} error
   */
  async markSessionErrored(id, error) {
    const session = await this.findById(id);
    const sessionErrors = session.errors || [];
    const newErrors = [...sessionErrors, error];
    await this.updateById(id, { errors: newErrors, completed_at: new Date() });
  }

  /**
   * Add debug info to a sync session
   * @param {SyncSession['id']} id
   * @param {Partial<SyncSessionInfo>} info
   */
  async addInfo(id, info) {
    const session = await this.findById(id);
    session.info = { ...session.info, ...info };
    await session.save();
  }

  /**
   * @param {SyncSession['id']} id
   * @param {{
   *   pullSince: SyncSession['pull_since'],
   *   pullUntil: SyncSession['pull_until']
   * }} metadata
   */
  async updatePullMetadata(id, { pullSince, pullUntil }) {
    await this.updateById(id, { pull_since: pullSince, pull_until: pullUntil });
  }
}
