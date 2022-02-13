/**
 * Tupaia
 * Copyright (c) 2017-2020 Beyond Essential Systems Pty Ltd
 */

import { types as pgTypes } from 'pg';
import knex from 'knex';

import { getConnectionConfig } from './getConnectionConfig';

// turn off parsing of timestamp (not timestamptz), so that it stays as a sort of "universal time"
// string, independent of timezones, rather than being converted to local time
pgTypes.setTypeParser(pgTypes.builtins.TIMESTAMP, val => val);

export class DataLakeDatabase {
  private connection: any;

  constructor() {
    this.connection = knex({
      client: 'pg',
      connection: getConnectionConfig(),
    });
  }

  async closeConnections() {
    return this.connection.destroy();
  }

  /**
   * Runs an arbitrary SQL query against the database.
   *
   * Use only for situations in which Knex is not able to assemble a query.
   */
  async executeSql(sqlString: string, parametersToBind: string[]) {
    const result = await this.connection.raw(sqlString, parametersToBind);
    return result.rows;
  }
}
