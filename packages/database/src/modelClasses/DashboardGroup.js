/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DashboardGroupType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_GROUP;
}

export class DashboardGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardGroupType;
  }
}
