import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

export const configureEnv = () => {
  configureDotEnv([
    path.resolve(__dirname, '../../../env/db.env'),
    path.resolve(__dirname, '../../../env/api-client.env'),
    path.resolve(__dirname, '../.env'),
  ]);
};
