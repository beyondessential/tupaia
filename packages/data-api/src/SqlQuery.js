/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class SqlQuery {
  constructor(baseQuery, baseParameters) {
    this.query = baseQuery;
    this.parameters = [...baseParameters];
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
  }
}
