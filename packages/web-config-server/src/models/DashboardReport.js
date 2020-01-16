/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class DashboardReport extends BaseModel {
  static databaseType = TYPES.DASHBOARD_REPORT;

  static fields = [
    'id',
    'drillDownLevel',
    'dataBuilder',
    'dataBuilderConfig',
    'viewJson',
    'dataServices',
  ];
}
