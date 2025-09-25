import winston from 'winston';

import { SyncDirections } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { generateId } from '../utilities';

const SERVICE_TYPES = {
  KOBO: 'kobo',
};

const syncStatuses = {
  syncing: 'SYNCING',
  idle: 'IDLE',
  error: 'ERROR',
};

export class DataServiceSyncGroupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_SERVICE_SYNC_GROUP;

  /**
   * @returns {Promise<import('./DataGroup').DataGroupRecord>}
   */
  async getDataGroup() {
    return ensure(
      await this.otherModels.dataGroup.findOne({ code: this.data_group_code }),
      `Sync group ${this.code} is not linked to an existing data group`,
    );
  }

  async setSyncIdle() {
    return this.model.update({ id: this.id }, { sync_status: syncStatuses.idle });
  }

  async setSyncStarted() {
    return this.model.update({ id: this.id }, { sync_status: syncStatuses.syncing });
  }

  async setSyncCompletedSuccessfully() {
    return this.model.update({ id: this.id }, { sync_status: syncStatuses.idle });
  }

  async setSyncFailed() {
    return this.model.update({ id: this.id }, { sync_status: syncStatuses.error });
  }

  isSyncing() {
    return this.sync_status === syncStatuses.syncing;
  }

  async log(message) {
    winston.info(`${this.code} SYNC_GROUP_LOG: ${message}`);
    await this.otherModels.syncGroupLog.create({
      id: generateId(),
      sync_group_code: this.code,
      service_type: this.service_type,
      log_message: message,
    });
  }

  async getLogsCount() {
    const [{ count }] = await this.database.executeSql(
      `
         SELECT count(sgl.*) FROM sync_group_log sgl
         JOIN data_service_sync_group dssg ON dssg.code = sgl.sync_group_code
         WHERE dssg.id = ?
       `,
      [this.id],
    );

    return parseInt(count);
  }

  async getLatestLogs(limit = 100, offset = 0) {
    const logs = await this.database.executeSql(
      `
         SELECT sgl.* FROM sync_group_log sgl
         JOIN data_service_sync_group dssg ON dssg.code = sgl.sync_group_code
         WHERE dssg.id = ?
         ORDER BY timestamp DESC
         LIMIT ?
         OFFSET ?
       `,
      [this.id, limit, offset],
    );

    return Promise.all(logs.map(this.otherModels.syncGroupLog.generateInstance));
  }
}

export class DataServiceSyncGroupModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  SERVICE_TYPES = SERVICE_TYPES;

  get DatabaseRecordClass() {
    return DataServiceSyncGroupRecord;
  }
}
