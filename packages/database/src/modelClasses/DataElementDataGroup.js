/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DataElementDataGroupType extends DatabaseType {
  static databaseType = TYPES.DATA_ELEMENT_DATA_GROUP;

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
  get DatabaseTypeClass() {
    return DataElementDataGroupType;
  }
}
