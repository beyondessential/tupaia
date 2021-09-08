/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class SqlQuery {
  static array = arr => `(${arr.map(() => '?').join(',')})`;

  static values = rows =>
    `VALUES (${rows.map(values => values.map(() => `?`).join(',')).join('), (')})`;

  static innerJoin = (baseTable, columnName, values) => `
    INNER JOIN (
      ${SqlQuery.values(values.map(c => [c]))}
    ) ${columnName}s(code) ON ${columnName}s.code = ${baseTable}.${columnName}
  `;

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
