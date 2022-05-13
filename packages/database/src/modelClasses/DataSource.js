/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

const DATA_ELEMENT = 'dataElement';
const DATA_GROUP = 'dataGroup';
const SYNC_GROUP = 'syncGroup';

const DATA_SOURCE_TYPES = {
  DATA_ELEMENT,
  DATA_GROUP,
  SYNC_GROUP,
};

const SERVICE_TYPES = {
  DHIS: 'dhis',
  TUPAIA: 'tupaia',
  INDICATOR: 'indicator',
  DATA_LAKE: 'data-lake',
};

const CONFIG_SCHEMA_BY_TYPE_AND_SERVICE = {
  [DATA_SOURCE_TYPES.DATA_ELEMENT]: {
    [SERVICE_TYPES.DHIS]: {
      categoryOptionCombo: {},
      dataElementCode: {},
      dhisInstanceCode: { default: 'regional' },
    },
    [SERVICE_TYPES.TUPAIA]: {},
    [SERVICE_TYPES.INDICATOR]: {},
    [SERVICE_TYPES.DATA_LAKE]: {},
  },
  [DATA_SOURCE_TYPES.DATA_GROUP]: {
    [SERVICE_TYPES.DHIS]: {
      dhisInstanceCode: { default: 'regional' },
    },
    [SERVICE_TYPES.TUPAIA]: {},
    [SERVICE_TYPES.INDICATOR]: {},
    [SERVICE_TYPES.DATA_LAKE]: {},
  },
};

const DHIS_DATA_TYPES = {
  DATA_ELEMENT: 'DataElement',
  INDICATOR: 'Indicator',
};

export class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;

  SERVICE_TYPES = SERVICE_TYPES;

  get dataElementCode() {
    return this.config.dataElementCode || this.code;
  }

  getTypes = () => DATA_SOURCE_TYPES;

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

  assertFnCalledByDataGroup = functionName => {
    if (this.type !== DATA_GROUP) {
      throw new Error(`Can only invoke "${functionName}" in a dataGroup`);
    }
  };

  attachDataElement = async dataElementId => {
    this.assertFnCalledByDataGroup(this.attachDataElement.name);

    await this.otherModels.dataElementDataGroup.findOrCreate({
      data_element_id: dataElementId,
      data_group_id: this.id,
    });
  };
}

export class DataSourceModel extends MaterializedViewLogDatabaseModel {
  static types = DATA_SOURCE_TYPES;

  SERVICE_TYPES = SERVICE_TYPES;

  get DatabaseTypeClass() {
    return DataSourceType;
  }

  getTypes = () => DataSourceModel.types;

  getDhisDataTypes = () => DHIS_DATA_TYPES;

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

  getDataGroupsThatIncludeElement = async elementConditions => {
    const dataElement = await this.findOne({ ...elementConditions, type: DATA_ELEMENT });
    if (!dataElement) {
      return [];
    }

    // TODO use `this.find` with joins after
    // https://github.com/beyondessential/tupaia-backlog/issues/662 is implemented
    const dataGroups = await this.database.executeSql(
      `
        SELECT dg.* FROM data_source dg
        JOIN data_element_data_group dedg ON dedg.data_group_id = dg.id
        WHERE dg.type = 'dataGroup' and dedg.data_element_id = ?;
      `,
      [dataElement.id],
    );
    return Promise.all(dataGroups.map(this.generateInstance));
  };
}
