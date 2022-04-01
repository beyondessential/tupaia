/**
 * Tupaia
 * Copyright (c) 2017-2020 Beyond Essential Systems Pty Ltd
 */

// @ts-expect-error pg has not types
import { types as pgTypes } from 'pg';
// @ts-expect-error must upgrade knex to get types. Note: last upgrade attempt broke json field querying
import knex from 'knex';

import { getConnectionConfig } from './getConnectionConfig';

// turn off parsing of timestamp (not timestamptz), so that it stays as a sort of "universal time"
// string, independent of timezones, rather than being converted to local time
pgTypes.setTypeParser(pgTypes.builtins.TIMESTAMP, (val: any) => val);

export class DataLakeDatabase {
  private connection: any;

  public constructor() {
    this.connection = knex({
      client: 'pg',
      connection: getConnectionConfig(),
    });
  }

  public async closeConnections() {
    return this.connection.destroy();
  }

  /**
   * Runs an arbitrary SQL query against the database.
   *
   * Use only for situations in which Knex is not able to assemble a query.
   */
  public async executeSql(sqlString: string, parametersToBind: string[]) {
    const result = await this.connection.raw(sqlString, parametersToBind);
    return result.rows;
  }
}
