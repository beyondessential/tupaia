/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import path from 'path';
import { configureDotEnv } from '@tupaia/server-utils';

export const configureEnv = () => {
  configureDotEnv([
    path.resolve(__dirname, '../../../env/servers.env'),
    path.resolve(__dirname, '../../../env/db.env'),
    path.resolve(__dirname, '../../../env/aws.env'),
    '.env',
  ]);
};
