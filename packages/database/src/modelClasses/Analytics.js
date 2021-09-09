/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class AnalyticsType extends DatabaseType {
  static databaseType = TYPES.ANALYTICS;
}

export class AnalyticsModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return AnalyticsType;
  }
}
