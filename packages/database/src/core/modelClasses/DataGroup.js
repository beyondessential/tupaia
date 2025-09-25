import { SyncDirections } from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

const SERVICE_TYPES = {
  DHIS: 'dhis',
  TUPAIA: 'tupaia',
  INDICATOR: 'indicator',
};

const CONFIG_SCHEMA_BY_SERVICE = {
  [SERVICE_TYPES.DHIS]: {
    dhisInstanceCode: { default: 'regional' },
  },
  [SERVICE_TYPES.TUPAIA]: {},
  [SERVICE_TYPES.INDICATOR]: {},
};

export class DataGroupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_GROUP;

  /**
   * @returns {Promise<import('./Survey').SurveyRecord>}
   */
  async getSurvey() {
    return ensure(
      await this.otherModels.survey.findOne({ data_group_id: this.id }),
      `No survey found for data group ${this.code}`,
    );
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

  attachDataElement = async dataElementId => {
    await this.otherModels.dataElementDataGroup.findOrCreate({
      data_element_id: dataElementId,
      data_group_id: this.id,
    });
  };
}

export class DataGroupModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DataGroupRecord;
  }

  async getDataElementsInDataGroup(dataGroupCode) {
    const dataGroup = await this.findOne({
      code: dataGroupCode,
    });

    // if the data group is not a defined data source, default to an empty array of elements
    if (!dataGroup) return [];

    const dataElements = await this.otherModels.dataElementDataGroup.find({
      data_group_id: dataGroup.id,
    });

    return this.otherModels.dataElement.find({
      id: dataElements.map(({ data_element_id: dataElementId }) => dataElementId),
    });
  }

  getDataGroupsThatIncludeElement = async elementConditions => {
    const dataElement = await this.otherModels.dataElement.findOne({ ...elementConditions });
    if (!dataElement) {
      return [];
    }

    return this.find(
      {
        'data_element_data_group.data_element_id': dataElement.id,
      },
      {
        joinWith: RECORDS.DATA_ELEMENT_DATA_GROUP,
        joinCondition: ['data_group.id', 'data_element_data_group.data_group_id'],
      },
    );
  };

  async buildSyncLookupQueryDetails() {
    return null;
  }
}
