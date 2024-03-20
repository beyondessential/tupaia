/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class DisasterEventRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DISASTER_EVENT;
}

export class DisasterEventModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DisasterEventRecord;
  }
}
