/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class PermissionGroupType extends DatabaseType {
  static databaseType = TYPES.PERMISSION_GROUP;
}

export class PermissionGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return PermissionGroupType;
  }
}
