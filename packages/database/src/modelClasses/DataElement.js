/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

const SERVICE_TYPES = {
  DHIS: 'dhis',
  TUPAIA: 'tupaia',
  INDICATOR: 'indicator',
  DATA_LAKE: 'data-lake',
};

const CONFIG_SCHEMA_BY_SERVICE = {
  [SERVICE_TYPES.DHIS]: {
    categoryOptionCombo: {},
    dataElementCode: {},
    dhisInstanceCode: { default: 'regional', allowNull: true },
    supersetChartId: {},
  },
  [SERVICE_TYPES.TUPAIA]: {},
  [SERVICE_TYPES.INDICATOR]: {},
  [SERVICE_TYPES.DATA_LAKE]: {},
};

const DHIS_DATA_TYPES = {
  DATA_ELEMENT: 'DataElement',
  INDICATOR: 'Indicator',
};

export class DataElementType extends DatabaseType {
  static databaseType = TYPES.DATA_ELEMENT;

  SERVICE_TYPES = SERVICE_TYPES;

  get dataElementCode() {
    return this.config.dataElementCode || this.code;
  }

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
        if (this.config[key] === null && configSchema[key].allowNull) {
          // keep as null
        } else {
          delete this.config[key];
        }
      }
    });
    // Use default values for valid empty fields
    Object.entries(configSchema).forEach(([key, { default: defaultValue, allowNull }]) => {
      if (defaultValue !== undefined && isEmpty(this.config[key])) {
        if (this.config[key] === null && allowNull) {
          // keep as null
        } else {
          // set to default
          this.config[key] = defaultValue;
        }
      }
    });
  }
}

export class DataElementModel extends MaterializedViewLogDatabaseModel {
  SERVICE_TYPES = SERVICE_TYPES;

  get DatabaseTypeClass() {
    return DataElementType;
  }

  getDhisDataTypes = () => DHIS_DATA_TYPES;
}
