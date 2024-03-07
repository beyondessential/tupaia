/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DashboardReportRecord extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_REPORT;
}

export class DashboardReportModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardReportRecord;
  }
}
