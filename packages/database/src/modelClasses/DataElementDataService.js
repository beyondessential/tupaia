/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { DatabaseModel } from '../DatabaseModel';

export class DataElementDataServiceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_ELEMENT_DATA_SERVICE;
}

export class DataElementDataServiceModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DataElementDataServiceRecord;
  }
}
