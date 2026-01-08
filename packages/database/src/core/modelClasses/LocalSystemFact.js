/**
 * @typedef {import('@tupaia/constants').SyncFact} SyncFact
 * @typedef {import('@tupaia/types').Project} Project
 */

import { SyncFact, SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { generateId } from '../utilities';

export class LocalSystemFactRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.LOCAL_SYSTEM_FACT;
}

export class LocalSystemFactModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return LocalSystemFactRecord;
  }

  /**
   * @param {SyncFact} key
   * @returns {Promise<string | null | undefined>}
   */
  async get(key) {
    const result = await this.findOne({ key });
    return result?.value;
  }

  /**
   * @param {SyncFact} key
   * @param {string | null} value
   */
  async set(key, value) {
    const existing = await this.findOne({ key });
    if (existing) {
      await this.update({ key }, { value });
    } else {
      await this.create({ id: generateId(), key, value });
    }
  }

  /**
   * @param {SyncFact} key
   * @param {number} amount
   * @returns {Promise<string>}
   */
  async incrementValue(key, amount = 1) {
    const rowsAffected = await this.database.executeSql(
      `
        UPDATE
          local_system_fact
        SET
          value = value::integer + ?
        WHERE
          key = ?
        RETURNING
          value;
      `,
      [amount, key],
    );

    if (rowsAffected.length === 0) {
      throw new Error(`The local system fact table does not include the fact ${key}`);
    }

    const fact = rowsAffected[0];
    return fact.value;
  }

  /** @param {Project['id']} projectId */
  async addProjectForSync(projectId) {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const existing = await this.findOne({ key: SyncFact.PROJECTS_IN_SYNC });
    const syncedProjects = existing?.value ? JSON.parse(existing.value) : [];
    const newSyncedProjects = [...new Set([...syncedProjects, projectId])];
    await this.set(SyncFact.PROJECTS_IN_SYNC, JSON.stringify(newSyncedProjects));
  }
}
