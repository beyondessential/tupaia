/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { modelClasses } from '@tupaia/database';

/**
 * Defines which data source(s) should be selected from the `data_source` table
 *
 * @typedef {Object} DataSourceSpec
 * @property {string|string[]} code  Matches on the code column
 * @property {string} type  Matches on the type column
 */

const assertDataSourceSpecIsValid = dataSourceSpec => {
  if (!dataSourceSpec || !dataSourceSpec.code || !dataSourceSpec.type) {
    throw new Error('Please provide a valid data source spec');
  }
};

export class DataSourceModel extends modelClasses.DataSource {
  getDefault = async ({ code, type }) =>
    this.generateInstance({
      code,
      type,
      service_type: 'dhis',
      config: {},
    });

  /**
   * Find the matching data sources or default to 1:1 mapping with dhis, as only mappings
   * with non-standard rules are kept in the db
   *
   * @param {DataSourceSpec} dataSourceSpec
   * @returns {Promise<Array>}
   */
  async findOrDefault(dataSourceSpec) {
    assertDataSourceSpecIsValid(dataSourceSpec);

    const records = await this.find(dataSourceSpec);
    const codeToRecord = keyBy(records, 'code');
    const { code: codeInput } = dataSourceSpec;
    const codes = Array.isArray(codeInput) ? codeInput : [codeInput];

    return Promise.all(
      codes.map(code => codeToRecord[code] || this.getDefault({ ...dataSourceSpec, code })),
    );
  }

  async findDataElementsOfDataGroup() {
    if (this.type !== this.dataSourceTypes.DATA_GROUP) {
      throw new Error(`Data source ${this.id} is not a data group`);
    }

    const dataElements = await this.otherModels.dataElementDataGroup.find({
      data_group_id: this.id,
      type: this.dataSourceTypes.DATA_ELEMENT,
    });

    return this.findOrDefault({
      code: dataElements.map(dataElement => dataElement.code),
      type: this.dataSourceTypes.DATA_ELEMENT,
    });
  }
}
