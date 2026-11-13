/** @typedef {import('@tupaia/types').DataElement} DataElement */

import { SyncDirections } from '@tupaia/constants';
import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const SERVICE_TYPES = /** @type {const} */ ({
  DHIS: 'dhis',
  TUPAIA: 'tupaia',
  INDICATOR: 'indicator',
});

const CONFIG_SCHEMA_BY_SERVICE = /** @type {const} */ ({
  [SERVICE_TYPES.DHIS]: {
    categoryOptionCombo: {},
    dataElementCode: {},
    dhisInstanceCode: { default: 'regional' },
  },
  [SERVICE_TYPES.TUPAIA]: {},
  [SERVICE_TYPES.INDICATOR]: {},
});

const DHIS_DATA_TYPES = /** @type {const} */ ({
  DATA_ELEMENT: 'DataElement',
  INDICATOR: 'Indicator',
});

export class DataElementRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_ELEMENT;

  SERVICE_TYPES = SERVICE_TYPES;

  constructor(...args) {
    super(...args);
    /** @type {DataElement['config']} */
    this.config;
  }

  /** @returns {DataElement['code']} */
  get dataElementCode() {
    return this.config.dataElementCode || this.code;
  }

  sanitizeConfig() {
    const configSchema = CONFIG_SCHEMA_BY_SERVICE[this.service_type];
    if (configSchema === undefined) {
      throw new Error(`No config schema for '${this.service_type}' service found`);
    }

    // `false` values are allowed in config
    const isEmpty = value => !value && value !== false;

    this.config ??= {};

    // Clear invalid/empty fields
    for (const key of Object.keys(this.config)) {
      if (!configSchema[key] || isEmpty(this.config[key])) {
        if (this.config[key] === null && configSchema[key].allowNull) {
          // keep as null
        } else {
          delete this.config[key];
        }
      }
    }
    // Use default values for valid empty fields
    for (const [key, { default: defaultValue, allowNull }] of Object.entries(configSchema)) {
      if (defaultValue !== undefined && isEmpty(this.config[key])) {
        if (this.config[key] === null && allowNull) {
          // keep as null
        } else {
          // set to default
          this.config[key] = defaultValue;
        }
      }
    }
  }
}

export class DataElementModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  SERVICE_TYPES = SERVICE_TYPES;

  get DatabaseRecordClass() {
    return DataElementRecord;
  }

  getDhisDataTypes = () => DHIS_DATA_TYPES;

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
