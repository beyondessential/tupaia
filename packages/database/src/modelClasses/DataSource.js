/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

const DATA_ELEMENT = 'dataElement';
const DATA_GROUP = 'dataGroup';
const DATA_SOURCE_TYPES = {
  DATA_ELEMENT,
  DATA_GROUP,
};

export class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;
}

export class DataSourceModel extends DatabaseModel {
  static types = DATA_SOURCE_TYPES;

  // eslint-disable-next-line class-methods-use-this
  get DatabaseTypeClass() {
    return DataSourceType;
  }

  getTypes = () => DataSourceModel.types;

  async getDataElementsInGroup(dataGroupCode) {
    const dataGroup = this.find({
      code: dataGroupCode,
      type: DATA_GROUP,
    });

    // if the data group is not a defined data source, default to an empty array of elements
    if (!dataGroup) return [];

    const dataElements = await this.otherModels.dataElementDataGroup.find({
      data_group_id: dataGroup.id,
    });

    return this.find({
      id: dataElements.map(({ id }) => id),
      type: DATA_ELEMENT,
    });
  }
}
