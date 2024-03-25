/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

export const configureEnv = () => {
  configureDotEnv([
    path.resolve(__dirname, '../../../env/.env.aggregation'),
    path.resolve(__dirname, '../../../env/.env.servers'),
    path.resolve(__dirname, '../../../env/.env.db'),
    path.resolve(__dirname, '../../../env/.env.dhis'),
    path.resolve(__dirname, '../../../env/.env.dataLake'),
    path.resolve(__dirname, '../../../env/.env.externalDBConnections'),
    path.resolve(__dirname, '../../../env/.env.superset'),
    path.resolve(__dirname, '../../../env/.env.weatherbit'),
    '.env',
  ]); // Load the environment variables into process.env
};
