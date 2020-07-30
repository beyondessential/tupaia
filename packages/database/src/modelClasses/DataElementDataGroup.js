/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DataElementDataGroupType extends DatabaseType {
  static databaseType = TYPES.DATA_ELEMENT_DATA_GROUP;

  static fieldValidators = new Map().set('data_element_id', [
    async (_, model) => {
      const dataElement = await model.dataElement();
      const dataGroup = await model.dataGroup();

      if (!dataElement || !dataGroup) {
        // Records do not exist, database will handle the foreign key check
        return null;
      }

      return dataGroup.service_type !== dataElement.service_type
        ? 'Data element must use the same service as the data group it belongs to'
        : null;
    },
  ]);

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
  // eslint-disable-next-line class-methods-use-this
  get DatabaseTypeClass() {
    return DataElementDataGroupType;
  }
}
