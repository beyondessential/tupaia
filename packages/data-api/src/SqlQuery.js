/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class SqlQuery {
  static parameteriseArray = arr => `(${arr.map(() => '?').join(',')})`;

  static parameteriseValues = rows =>
    `VALUES (${rows.map(values => values.map(() => `?`).join(',')).join('), (')})`;

  constructor(baseQuery, baseParameters = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
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
