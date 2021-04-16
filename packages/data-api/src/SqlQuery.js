/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class SqlQuery {
  static parameteriseArray = arr => `(${arr.map(() => '?').join(',')})`;

  static parameteriseValues = (values, paramsArray) => {
    if (paramsArray) paramsArray.push(...values);
    return `VALUES (${values.map(() => `?`).join('), (')})`;
  };

  constructor(baseQuery, baseParameters = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
  }

  addOrderByClause(orderByClause) {
    this.query = `
      ${this.query}
      ORDER BY ${orderByClause}
    `;
  }

  async executeOnDatabase(database) {
    return database.executeSql(this.query, this.parameters);
  }

  loggableQuery() {
    const replacementIterator = this.parameters
      .map(param => param.replace(/'/g, "''"))
      [Symbol.iterator]();
    return this.query.replace(/\?/g, () => `'${replacementIterator.next().value}'`);
  }
}
