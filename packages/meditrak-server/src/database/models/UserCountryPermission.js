/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '..';

class UserCountryPermissionType extends DatabaseType {
  static databaseType = TYPES.USER_COUNTRY_PERMISSION;

  static joins = [
    {
      fields: {
        code: 'country_code',
      },
      joinWith: TYPES.COUNTRY,
      joinCondition: [`${TYPES.COUNTRY}.id`, `${TYPES.USER_COUNTRY_PERMISSION}.country_id`],
    },
  ];

  async country() {
    return this.otherModels.country.findById(this.country_id);
  }

  async user() {
    return this.otherModels.user.findById(this.user_id);
  }

  async permissionGroup() {
    return this.otherModels.permissionGroup.findById(this.permission_group_id);
  }
}

export class UserCountryPermissionModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserCountryPermissionType;
  }

  get isDeletable() {
    return true;
  }
}
