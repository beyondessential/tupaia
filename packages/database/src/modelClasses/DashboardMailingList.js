/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class DashboardMailingListType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_MAILING_LIST;
}

export class DashboardMailingListModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardMailingListType;
  }
}
