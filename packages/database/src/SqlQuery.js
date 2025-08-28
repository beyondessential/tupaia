/**
 * @template Result
 * Class for building custom SQL queries for directly querying a database
 */
export class SqlQuery {
  /**
   * @public
   * @param {unknown[]} arr
   * @param {string} type type of array (if the array may be empty postgres requires typecasting)
   * @returns {string} SQL parameter injection string for the array of values
   */
  static array = (arr, type) =>
    `ARRAY[${arr.map(() => '?').join(',')}]${type ? `::${type}[]` : ''}`;

  /**
   * @public
   * @param {unknown[]} arr
   * @returns {string} SQL parameter injection string for the array of values
   */
  static record = arr => `(${arr.map(() => '?').join(',')})`;

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
  constructor(baseQuery = '', baseParameters = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
  }

  /**
   * Add additional sql (and parameters) to the existing query
   * @public
   * @param {string | { query: string, params: unknown[] }} sql
   */
  append(sqlOrSqlAndParams) {
    if (typeof sqlOrSqlAndParams === 'string') {
      this.query = this.query.concat(sqlOrSqlAndParams);
      return;
    }

    const { query: sql, params: paramsInText = [] } = sqlOrSqlAndParams;
    this.query = this.query.concat(sql);
    this.parameters.push(...paramsInText);
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
      .map(param => (typeof param === 'string' ? param.replaceAll("'", "''") : param))
      [Symbol.iterator]();
    return this.query.replaceAll('?', () => `'${replacementIterator.next().value}'`);
  }
}
