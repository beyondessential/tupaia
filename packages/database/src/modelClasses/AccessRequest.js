import { ensure } from '@tupaia/tsutils';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class AccessRequestRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ACCESS_REQUEST;

  async getEntity() {
    return ensure(
      await this.otherModels.entity.findById(this.entity_id),
      `Couldn’t find entity for access request ${this.id} (expected entity with ID ${this.entity_id})`,
    );
  }

  async getPermissionGroup() {
    if (!this.permission_group_id) return null;
    return ensure(
      await this.otherModels.permissionGroup.findById(this.permission_group_id),
      `Couldn’t find permission group for access request ${this.id} (expected permission group with ID ${this.permission_group_id})`,
    );
  }
}

export class AccessRequestModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return AccessRequestRecord;
  }
}
