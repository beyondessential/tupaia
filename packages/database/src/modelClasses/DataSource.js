/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

const DATA_SOURCE_TYPES = {
  question: 'question',
  survey: 'survey',
};
const DEAFULT_DATA_SOURCE_TYPE = DATA_SOURCE_TYPES.question; // default to a question data source

class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;
}

/**
 * Defines which data source should be selected. Polymorphic, allowing a simple code, or a code and
 * type within an object
 *
 * @typedef {Object} DataSourceSpec
 * @property {string} code    Matches on the code column
 * @property {string} [type]  Matches on the type column
 */

/**
 * @param {DataSourceSpec} dataSourceSpec
 */
function extractDetailsFromDataSourceSpec(dataSourceSpec) {
  const { code, type = DEAFULT_DATA_SOURCE_TYPE } = dataSourceSpec;
  if (!code) throw new Error('Data Source specs must provide a code');
  return { code, type };
}

export class DataSourceModel extends DatabaseModel {
  static types = DATA_SOURCE_TYPES;

  /**
   * Find the matching data source, or default to 1:1 mapping with dhis, as only mappings
   * with non-standard rules are kept in the db
   * @param {DataSourceSpec} dataSourceSpec
   */
  async fetchFromDbOrDefault(dataSourceSpec) {
    const { code, type } = extractDetailsFromDataSourceSpec(dataSourceSpec);
    const dataSourceRecord = await this.findOne({ code, type });
    return dataSourceRecord || { code, type, service_type: 'dhis', config: {} };
  }

  // eslint-disable-next-line class-methods-use-this
  get DatabaseTypeClass() {
    return DataSourceType;
  }
}
