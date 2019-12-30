/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { BaseModel } from './BaseModel';

export class DashboardReport extends BaseModel {
  static databaseType = 'dashboardReport';

  static fields = [
    'id',
    'drillDownLevel',
    'dataBuilder',
    'dataBuilderConfig',
    'viewJson',
    'dataServices',
  ];
}
