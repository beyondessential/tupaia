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

const SERVICE_TYPES = {
  DHIS: 'dhis',
  TUPAIA: 'tupaia',
};

const CONFIG_KEYS_BY_TYPE_AND_SERVICE = {
  [DATA_SOURCE_TYPES.DATA_ELEMENT]: {
    [SERVICE_TYPES.DHIS]: ['categoryOptionCombo', 'dataElementCode', 'isDataRegional'],
    [SERVICE_TYPES.TUPAIA]: [],
  },
  [DATA_SOURCE_TYPES.DATA_GROUP]: {
    [SERVICE_TYPES.DHIS]: ['isDataRegional'],
    [SERVICE_TYPES.TUPAIA]: [],
  },
};

export class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;

  get dataElementCode() {
    return this.config.dataElementCode || this.code;
  }
}

export class DataSourceModel extends DatabaseModel {
  notifiers = [onUpsertSanitizeConfig];

  static types = DATA_SOURCE_TYPES;

  // eslint-disable-next-line class-methods-use-this
  get DatabaseTypeClass() {
    return DataSourceType;
  }

  getTypes = () => DataSourceModel.types;

  async getDataElementsInGroup(dataGroupCode) {
    const dataGroup = await this.findOne({
      code: dataGroupCode,
      type: DATA_GROUP,
    });

    // if the data group is not a defined data source, default to an empty array of elements
    if (!dataGroup) return [];

    const dataElements = await this.otherModels.dataElementDataGroup.find({
      data_group_id: dataGroup.id,
    });

    return this.find({
      id: dataElements.map(({ data_element_id: dataElementId }) => dataElementId),
      type: DATA_ELEMENT,
    });
  }
}

export const onUpsertSanitizeConfig = async (change, models) => {
  const { type: changeType, record, record_id: id } = change;
  if (changeType !== 'update') {
    return;
  }

  const { type, service_type: serviceType, config } = record;
  const dataSource = await models.dataSource.findById(id);
  const validKeys = CONFIG_KEYS_BY_TYPE_AND_SERVICE[type][serviceType];
  if (!validKeys) {
    throw new Error(
      `Please specify the valid config keys for '${serviceType}' service in the DataSource model`,
    );
  }

  Object.keys(config).forEach(key => {
    if (!validKeys.includes(key)) {
      delete dataSource.config[key];
    }
  });
  await dataSource.save();
};
