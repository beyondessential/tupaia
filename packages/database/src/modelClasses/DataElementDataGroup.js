/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class DataElementDataGroupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_ELEMENT_DATA_GROUP;

  async dataElement() {
    return this.otherModels.dataElement.findOne({
      id: this.data_element_id,
    });
  }

  async dataGroup() {
    return this.otherModels.dataGroup.findOne({
      id: this.data_group_id,
    });
  }
}

export class DataElementDataGroupModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DataElementDataGroupRecord;
  }
}
