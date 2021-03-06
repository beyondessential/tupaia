/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class ReportType extends DatabaseType {
  static databaseType = TYPES.REPORT;
}

export class ReportModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return ReportType;
  }
}
