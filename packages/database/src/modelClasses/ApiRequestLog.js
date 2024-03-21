/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ApiRequestLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.API_REQUEST_LOG;
}

export class ApiRequestLogModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return ApiRequestLogRecord;
  }
}
