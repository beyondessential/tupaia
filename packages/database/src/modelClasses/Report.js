/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class ReportType extends DatabaseType {
  static databaseType = TYPES.REPORT;

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
  get DatabaseTypeClass() {
    return ReportType;
  }
}
