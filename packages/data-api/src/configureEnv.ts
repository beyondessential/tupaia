import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

export const configureEnv = () =>
  configureDotEnv([
    path.resolve(__dirname, '../../../env/servers.env'),
    path.resolve(__dirname, '../../../env/db.env'),
    path.resolve(__dirname, '../.env'),
  ]); // Load the environment variables into process.env
