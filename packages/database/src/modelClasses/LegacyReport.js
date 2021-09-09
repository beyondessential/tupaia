/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class LegacyReportType extends DatabaseType {
  static databaseType = TYPES.LEGACY_REPORT;
}

export class LegacyReportModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return LegacyReportType;
  }
}
