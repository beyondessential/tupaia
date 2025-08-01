import { SyncDirections } from '@tupaia/constants';

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
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DataElementDataGroupRecord;
  }
}
