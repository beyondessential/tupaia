/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';

import { modelClasses } from '@tupaia/database';

export class DataSourceModel extends modelClasses.DataSource {
  getDefault = (code, type) => ({ code, type, service_type: 'dhis', config: {} });

  /**
   * Find the matching data source, or default to 1:1 mapping with dhis, as only mappings
   * with non-standard rules are kept in the db
   */
  async findOneOrDefault({ code, type }) {
    const dataSourceRecord = await this.findOne({ code, type });
    return dataSourceRecord || this.getDefault(code, type);
  }

  async findOrDefault({ code: codes, type }) {
    const records = await this.find({ code: codes, type });
    const codeToRecord = keyBy(records, 'code');
    return codes.map(code => codeToRecord[code] || this.getDefault(code, type));
  }
}
