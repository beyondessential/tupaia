/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DataSourceType extends DatabaseType {
  static databaseType = TYPES.DATA_SOURCE;
}

export class DataSourceModel extends DatabaseModel {
  static types = {
    question: 'question',
    survey: 'survey',
  };

  // default to 1:1 mapping with dhis, as only mappings with non-standard rules are kept in the db
  async fetchFromDbOrDefault(code, type) {
    const dataSourceRecord = await this.findOne({ code });
    const dataSource = dataSourceRecord || { code, type, service_type: 'dhis', config: {} };

    if (dataSource && dataSource.type !== type) {
      throw new Error(`Invalid type '${type}' provided for data source with code '${code}'`);
    }
    return dataSource;
  }

  // eslint-disable-next-line class-methods-use-this
  get DatabaseTypeClass() {
    return DataSourceType;
  }
}
