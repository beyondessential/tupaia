/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

export const configureEnv = () =>
  configureDotEnv([
    path.resolve(__dirname, '../../../env/.env.servers'),
    path.resolve(__dirname, '../../../env/.env.db'),
    '.env',
  ]); // Load the environment variables into process.env
