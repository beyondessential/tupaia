import ClientPgLite from 'knex-pglite';

import { getConnectionConfig } from './getConnectionConfig';
import { BaseDatabase } from '../core';

export class DatatrakDatabase extends BaseDatabase {
  constructor() {
    super(undefined, undefined, ClientPgLite, getConnectionConfig);
  }
}
