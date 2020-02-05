/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
import { DatabaseError } from '@tupaia/utils';

class UserFacilityPermissionType extends DatabaseType {
  static databaseType = TYPES.USER_FACILITY_PERMISSION;

  static joins = [
    {
      fields: {
        code: 'code',
      },
      joinWith: TYPES.FACILITY,
      joinCondition: [`${TYPES.FACILITY}.id`, `${TYPES.USER_FACILITY_PERMISSION}.clinic_id`],
    },
    {
      fields: {
        name: 'permission_group_name',
      },
      joinWith: TYPES.PERMISSION_GROUP,
      joinCondition: [
        `${TYPES.PERMISSION_GROUP}.id`,
        `${TYPES.USER_FACILITY_PERMISSION}.permission_group_id`,
      ],
    },
  ];

  async facility() {
    return this.otherModels.facility.findById(this.clinic_id);
  }

  async user() {
    return this.otherModels.user.findById(this.user_id);
  }

  async permissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }

  async getPermissionAncestorPath() {
    const facility = await this.facility();
    const geographicalAreaTree = await this.otherModels.geographicalArea.getAncestorsPath(
      facility.geographical_area_id,
    );
    if (geographicalAreaTree.length === 0) {
      throw new DatabaseError('facility must have a valid Geographical Area');
    }

    const country = await geographicalAreaTree[0].country();

    return [facility, ...geographicalAreaTree, country];
  }
}

export class UserFacilityPermissionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserFacilityPermissionType;
  }

  isDeletableViaApi = true;
}
