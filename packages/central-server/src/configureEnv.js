/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

const envFilePaths = [
  path.resolve(__dirname, '../../../env/.env.db'),
  path.resolve(__dirname, '../../../env/.env.servers'),
  path.resolve(__dirname, '../../../env/.env.pg'),
  path.resolve(__dirname, '../../../env/.env.dhis'),
  path.resolve(__dirname, '../../../env/.envexternalDBConnections'),
  path.resolve(__dirname, '../../../env/.env.mail'),
  path.resolve(__dirname, '../../../env/.env.aws'),
  path.resolve(__dirname, '../../../env/.env.aggregation'),
  path.resolve(__dirname, '.env'),
];

export const configureEnv = () => {
  configureDotEnv(envFilePaths);
};
