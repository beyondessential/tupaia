/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ReportRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.REPORT;

  /**
   * @returns {Promise<string>} name of permission group
   */
  async permissionGroupName() {
    const permissionGroup = await this.otherModels.permissionGroup.findById(
      this.permission_group_id,
    );
    return permissionGroup.name;
  }
}

export class ReportModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return ReportRecord;
  }
}
