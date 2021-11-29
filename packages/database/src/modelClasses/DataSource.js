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
};

const CONFIG_SCHEMA_BY_SERVICE = {
  [SERVICE_TYPES.DHIS]: {
    categoryOptionCombo: {},
    dataElementCode: {},
    isDataRegional: { default: true },
  },
  [SERVICE_TYPES.TUPAIA]: {},
  [SERVICE_TYPES.INDICATOR]: {},
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
    const configSchema = CONFIG_SCHEMA_BY_SERVICE[this.service_type];
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

export class DataSourceModel extends MaterializedViewLogDatabaseModel {
  static types = DATA_SOURCE_TYPES;

  SERVICE_TYPES = SERVICE_TYPES;

  get DatabaseTypeClass() {
    return DataSourceType;
  }

  getTypes = () => DataSourceModel.types;

  getDhisDataTypes = () => DHIS_DATA_TYPES;
}
