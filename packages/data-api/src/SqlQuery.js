/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class SqlQuery {
  static parameteriseArray = arr => `(${arr.map(() => '?').join(',')})`;
  static parameteriseValues = arr => `VALUES (${arr.map(() => `?`).join('), (')})`;

  constructor(baseQuery, baseParameters = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
    this.orderByClause = null;
    this.hasWhereClause = false;
  }

  addWhereClause(clause, parameters) {
    this.query = `
      ${this.query}
      ${this.hasWhereClause ? 'AND' : 'WHERE'} ${clause}
    `;
    this.parameters = this.parameters.concat(parameters);
  }

  orderBy(orderByClause) {
    this.orderByClause = orderByClause;
  }

  async executeOnDatabase(database) {
    return database.executeSql(
      `
      ${this.query}
      ${this.orderByClause ? `ORDER BY ${this.orderByClause}` : ''};
    `,
      this.parameters,
    );
  }
}
