/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class SqlQuery {
  static parameteriseArray = arr => `(${arr.map(() => '?').join(',')})`;

  static parameteriseValues = (arr, startIndex = 0) => {
    return `VALUES (${arr.map((item, index) => `$${startIndex + index + 1}`).join('), (')})`;
  };

  constructor(baseQuery, baseParameters = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
    this.orderByClause = null;
  }

  addClause(clause, parameters) {
    this.query = `
      ${this.query}
      ${clause}
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

  async executeOnDatabaseViaPgClient(database) {
    return database.executeSqlViaPgClient(
      `
      ${this.query}
      ${this.orderByClause ? `ORDER BY ${this.orderByClause}` : ''};
    `,
      this.parameters,
    );
  }
}
