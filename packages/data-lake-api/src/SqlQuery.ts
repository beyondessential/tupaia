/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataLakeDatabase } from './DataLakeDatabase';

export class SqlQuery {
  private readonly query: string;

  private readonly parameters: string[];

  public static array = (arr: any[]) => `(${arr.map(() => '?').join(',')})`;

  public static values = (rows: any[][]) =>
    `VALUES (${rows.map(values => values.map(() => '?').join(',')).join('), (')})`;

  public static innerJoin = (baseTable: string, columnName: string, values: any[]) => `
    INNER JOIN (
      ${SqlQuery.values(values.map(c => [c]))}
    ) ${columnName}s(code) ON ${columnName}s.code = ${baseTable}.${columnName}
  `;

  public constructor(baseQuery: string, baseParameters: string[] = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
  }

  public async executeOnDatabase(database: DataLakeDatabase) {
    return database.executeSql(this.query, this.parameters);
  }

  public loggableQuery() {
    const replacementIterator = this.parameters
      .map(param => param.replace(/'/g, "''"))
      [Symbol.iterator]();
    return this.query.replace(/\?/g, () => `'${replacementIterator.next().value}'`);
  }
}
