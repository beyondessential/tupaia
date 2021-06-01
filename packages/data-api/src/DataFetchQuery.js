/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { SqlQuery } from './SqlQuery';

// Fields unique to each answer
export const ANSWER_SPECIFIC_FIELDS = ['entity_name', 'date', 'event_id', 'value', 'type'];

export class DataFetchQuery {
  constructor(database, options) {
    // database
    this.database = database;

    // immutable options, broken out into fields
    const { dataElementCodes, organisationUnitCodes, dataGroupCode, startDate, endDate } = options;
    this.dataElementCodes = dataElementCodes;
    this.entityCodes = organisationUnitCodes;
    this.dataGroupCode = dataGroupCode;
    this.startDate = startDate;
    this.endDate = endDate;

    // mutable query details to be built
    this.query = '';
    this.paramsArray = [];
  }

  async fetch() {
    this.build();

    const sqlQuery = new SqlQuery(this.query, this.paramsArray);
    return sqlQuery.executeOnDatabase(this.database);
  }

  parameteriseArray(array) {
    this.paramsArray.push(...array);
    return SqlQuery.parameteriseArray(array);
  }

  parameteriseValues(values) {
    this.paramsArray.push(...values.flat());
    return SqlQuery.parameteriseValues(values);
  }

  createInnerJoin(codes, columnName) {
    return `
      INNER JOIN (
        ${this.parameteriseValues(codes.map(c => [c]))}
      ) ${columnName}s(code) ON ${columnName}s.code = analytics.${columnName}
    `;
  }
}
