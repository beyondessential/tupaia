/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TupaiaDatabase } from '@tupaia/database';

export class SqlQuery<Result = unknown> {
  public static array = (arr: unknown[]) => `(${arr.map(() => '?').join(',')})`;

  public static values = (rows: unknown[][]) =>
    `VALUES (${rows.map(values => values.map(() => '?').join(',')).join('), (')})`;

  public static innerJoin = (baseTable: string, columnName: string, values: unknown[]) => `
    INNER JOIN (
      ${SqlQuery.values(values.map(c => [c]))}
    ) ${columnName}s(code) ON ${columnName}s.code = ${baseTable}.${columnName}
  `;

  private readonly query: string;
  private readonly parameters: string[];

  public constructor(baseQuery: string, baseParameters: string[] = []) {
    this.query = baseQuery;
    this.parameters = baseParameters;
  }

  public async executeOnDatabase(database: TupaiaDatabase) {
    return database.executeSql(this.query, this.parameters) as Promise<Result>;
  }

  public loggableQuery() {
    const replacementIterator = this.parameters
      .map(param => param.replace(/'/g, "''"))
      [Symbol.iterator]();
    return this.query.replace(/\?/g, () => `'${replacementIterator.next().value}'`);
  }
}
