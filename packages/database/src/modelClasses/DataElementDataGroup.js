/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DataElementDataGroupType extends DatabaseType {
  static databaseType = TYPES.DATA_ELEMENT_DATA_GROUP;

  get dataSourceTypes() {
    return this.otherModels.dataSource.getTypes();
  }

  async dataElement() {
    return this.otherModels.dataSource.findOne({
      id: this.data_element_id,
      type: this.dataSourceTypes.DATA_ELEMENT,
    });
  }

  async dataGroup() {
    return this.otherModels.dataSource.findOne({
      id: this.data_group_id,
      type: this.dataSourceTypes.DATA_GROUP,
    });
  }
}

export class DataElementDataGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DataElementDataGroupType;
  }
}
