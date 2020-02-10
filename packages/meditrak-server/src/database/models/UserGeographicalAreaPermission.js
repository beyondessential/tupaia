/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';

class UserGeographicalAreaPermissionType extends DatabaseType {
  static databaseType = TYPES.USER_GEOGRAPHICAL_AREA_PERMISSION;

  static joins = [
    {
      fields: {
        code: 'code',
      },
      joinWith: TYPES.GEOGRAPHICAL_AREA,
      joinCondition: [
        `${TYPES.GEOGRAPHICAL_AREA}.id`,
        `${TYPES.USER_GEOGRAPHICAL_AREA_PERMISSION}.geographical_area_id`,
      ],
    },
    {
      fields: {
        name: 'permission_group_name',
      },
      joinWith: TYPES.PERMISSION_GROUP,
      joinCondition: [
        `${TYPES.PERMISSION_GROUP}.id`,
        `${TYPES.USER_GEOGRAPHICAL_AREA_PERMISSION}.permission_group_id`,
      ],
    },
  ];

  async geographicalArea() {
    return this.otherModels.geographicalArea.findById(this.geographical_area_id);
  }

  async user() {
    return this.otherModels.user.findById(this.user_id);
  }

  async permissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  async getGeographicalAreaPath() {
    const geographicalArea = await this.geographicalArea();
    const parents = await geographicalArea.getParents();
    const country = await geographicalArea.country();

    return [geographicalArea, ...parents, country];
  }
}

export class UserGeographicalAreaPermissionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserGeographicalAreaPermissionType;
  }

  isDeletableViaApi = true;
}
