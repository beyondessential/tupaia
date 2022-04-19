/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * @template Result
 * Class for building custom SQL queries for directly querying a database
 */
export class SqlQuery {
  /**
   * @public
   * @param {unknown[]} arr
   * @returns {string} SQL parameter injection string for the array of values
   */
  static array = arr => `(${arr.map(() => '?').join(',')})`;

  /**
   * @public
   * @param {unknown[][]} rows
   * @returns {string} SQL parameter injection rows of values
   */
  static values = rows =>
    `VALUES (${rows.map(values => values.map(() => '?').join(',')).join('), (')})`;

  /**
   * @public
   * @param {string} baseTable table to join against
   * @param {string} columnName column to join against
   * @param {unknown[]} values values in join table
   * @returns {string}
   */
  static innerJoin = (baseTable, columnName, values) => `
     INNER JOIN (
       ${SqlQuery.values(values.map(c => [c]))}
     ) ${columnName}s(code) ON ${columnName}s.code = ${baseTable}.${columnName}
   `;

  /**
   * @private
   * @readonly
   */
  query;

  /**
   * @private
   * @readonly
   */
  parameters;

  /**
   * @public
   * @param {string} baseQuery
   * @param {string[]} [baseParameters]
   */
  constructor(baseQuery, baseParameters = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
  }

  /**
   * @public
   * @param {{ executeSql: (query: string, parameters: string[]) => Promise<unknown> }} database
   * @returns {Promise<Result>} execution result
   */
  async executeOnDatabase(database) {
    return database.executeSql(this.query, this.parameters);
  }

  /**
   * @public
   * @returns query string with all parameter replacements made, in SQL queryable format
   */
  loggableQuery() {
    const replacementIterator = this.parameters
      .map(param => param.replace(/'/g, "''"))
      [Symbol.iterator]();
    return this.query.replace(/\?/g, () => `'${replacementIterator.next().value}'`);
  }
}
