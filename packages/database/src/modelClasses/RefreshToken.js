/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class RefreshTokenRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.REFRESH_TOKEN;
}

export class RefreshTokenModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return RefreshTokenRecord;
  }
}
