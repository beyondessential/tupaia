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
  INDICATOR: 'indicator',
};

const CONFIG_SCHEMA_BY_TYPE_AND_SERVICE = {
  [DATA_SOURCE_TYPES.DATA_ELEMENT]: {
    [SERVICE_TYPES.DHIS]: {
      categoryOptionCombo: {},
      dataElementCode: {},
      isDataRegional: { default: true },
    },
    [SERVICE_TYPES.TUPAIA]: {},
    [SERVICE_TYPES.INDICATOR]: {},
  },
  [DATA_SOURCE_TYPES.DATA_GROUP]: {
    [SERVICE_TYPES.DHIS]: {
      isDataRegional: { default: true },
    },
    [SERVICE_TYPES.TUPAIA]: {},
    [SERVICE_TYPES.INDICATOR]: {},
  },
};

export class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;

  get dataElementCode() {
    return this.config.dataElementCode || this.code;
  }

  sanitizeConfig() {
    const configSchema = CONFIG_SCHEMA_BY_TYPE_AND_SERVICE[this.type][this.service_type];
    if (!configSchema) {
      throw new Error(`No config schema for '${this.service_type}' service found`);
    }

    // `false` values are allowed in config
    const isEmpty = value => !value && value !== false;

    if (!this.config) {
      this.config = {};
    }
    // Clear invalid/empty fields
    Object.keys(this.config).forEach(key => {
      if (!configSchema[key] || isEmpty(this.config[key])) {
        delete this.config[key];
      }
    });
    // Use default values for valid empty fields
    Object.entries(configSchema).forEach(([key, { default: defaultValue }]) => {
      if (defaultValue !== undefined && isEmpty(this.config[key])) {
        this.config[key] = defaultValue;
      }
    });
  }
}

export class DataSourceModel extends DatabaseModel {
  static types = DATA_SOURCE_TYPES;

  SERVICE_TYPES = SERVICE_TYPES;

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
