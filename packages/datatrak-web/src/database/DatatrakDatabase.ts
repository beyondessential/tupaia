import ClientPgLite from 'knex-pglite';

import { BaseDatabase } from '@tupaia/database';
import { getConnectionConfig } from './getConnectionConfig';

export class DatatrakDatabase extends BaseDatabase {
  constructor() {
    super(undefined, undefined, ClientPgLite, getConnectionConfig);
  }
}
