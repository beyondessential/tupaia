/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class AnalyticsRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANALYTICS;
}

export class AnalyticsModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return AnalyticsRecord;
  }
}
