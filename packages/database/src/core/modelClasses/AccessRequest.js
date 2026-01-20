import { SyncDirections } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class AccessRequestRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ACCESS_REQUEST;

  /**
   * @returns {Promise<import('./Entity').EntityRecord>}
   */
  async getEntity() {
    return ensure(
      await this.otherModels.entity.findById(this.entity_id),
      `Couldn’t find entity for access request ${this.id} (expected entity with ID ${this.entity_id})`,
    );
  }

  /**
   * @returns {Promise<import('./PermissionGroup').PermissionGroupRecord | null>}
   */
  async getPermissionGroup() {
    if (!this.permission_group_id) return null;
    return ensure(
      await this.otherModels.permissionGroup.findById(this.permission_group_id),
      `Couldn’t find permission group for access request ${this.id} (expected permission group with ID ${this.permission_group_id})`,
    );
  }
}

export class AccessRequestModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return AccessRequestRecord;
  }
}
