/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { MaterializedViewLogDatabaseModel } from '../analytics';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

// TODO: Move this out to something shared
const SERVICE_TYPES = {
  DHIS: 'dhis',
  TUPAIA: 'tupaia',
  INDICATOR: 'indicator',
};

const CONFIG_SCHEMA_BY_SERVICE = {
  [SERVICE_TYPES.DHIS]: {
    isDataRegional: { default: true },
  },
  [SERVICE_TYPES.TUPAIA]: {},
  [SERVICE_TYPES.INDICATOR]: {},
};

export class EventType extends DatabaseType {
  static databaseType = TYPES.EVENT;

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

  attachDataElement = async dataElementId => {
    await this.otherModels.dataElementDataGroup.findOrCreate({
      data_element_id: dataElementId,
      event_id: this.id,
    });
  };
}

export class EventModel extends MaterializedViewLogDatabaseModel {
  get DatabaseTypeClass() {
    return EventType;
  }

  async getDataElementsInEvent(eventCode) {
    const event = await this.findOne({
      code: eventCode,
    });

    // if the data group is not a defined data source, default to an empty array of elements
    if (!event) return [];

    const dataElements = await this.otherModels.dataElementDataGroup.find({
      event_id: event.id,
    });

    return this.otherModels.dataSource.find({
      id: dataElements.map(({ data_element_id: dataElementId }) => dataElementId),
    });
  }

  getEventsThatIncludeElement = async elementConditions => {
    const dataElement = await this.otherModels.dataSource.findOne({ ...elementConditions });
    if (!dataElement) {
      return [];
    }

    return this.find(
      {
        'data_element_data_group.data_element_id': dataElement.id,
      },
      {
        joinWith: TYPES.DATA_ELEMENT_DATA_GROUP,
        joinCondition: ['event.id', 'data_element_data_group.event_id'],
      },
    );
  };
}
