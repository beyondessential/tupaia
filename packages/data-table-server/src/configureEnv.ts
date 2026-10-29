import path from 'node:path';
import { configureDotEnv } from '@tupaia/server-utils';

const paths = [
  '../../../env/aggregation.env',
  '../../../env/api-client.env',
  '../../../env/db.env',
  '../../../env/dhis.env',
  /** We hit a character limit in the external-db-connections Bitwarden note */
  '../../../env/external-db-connections.env',
  '../../../env/external-db-connections-2.env',
  '../../../env/external-db-connections-3.env',
  '../../../env/servers.env',
  '../../../env/weatherbit.env',
  '../.env',
] as const;

export const configureEnv = () => {
  configureDotEnv(paths.map(p => path.resolve(__dirname, p)));
};
