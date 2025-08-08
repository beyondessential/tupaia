import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

export const configureEnv = () => {
  configureDotEnv([
    path.resolve(__dirname, '../../../env/aggregation.env'),
    path.resolve(__dirname, '../../../env/db.env'),
    path.resolve(__dirname, '../../../env/dhis.env'),
    path.resolve(__dirname, '../../../env/mail.env'),
    path.resolve(__dirname, '../../../env/pg.env'),
    path.resolve(__dirname, '../../../env/servers.env'),
    path.resolve(__dirname, '../../../env/superset.env'),
    path.resolve(__dirname, '../../../env/api-client.env'),
    path.resolve(__dirname, '../.env'),
  ]);
};
