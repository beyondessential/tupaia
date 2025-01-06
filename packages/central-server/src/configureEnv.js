/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

const envFilePaths = [
  path.resolve(__dirname, '../../../env/db.env'),
  path.resolve(__dirname, '../../../env/servers.env'),
  path.resolve(__dirname, '../../../env/pg.env'),
  path.resolve(__dirname, '../../../env/dhis.env'),
  path.resolve(__dirname, '../../../env/external-db-connections.env'),
  path.resolve(__dirname, '../../../env/mail.env'),
  path.resolve(__dirname, '../../../env/aws.env'),
  path.resolve(__dirname, '../../../env/aggregation.env'),
  path.resolve(__dirname, '../../../env/api-client.env'),
  path.resolve(__dirname, '../../../env/platform.env'),
  path.resolve(__dirname, '../.env'),
];

export const configureEnv = () => {
  configureDotEnv(envFilePaths);
};
