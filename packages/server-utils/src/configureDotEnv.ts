/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import dotenv from 'dotenv';

export const configureDotEnv = (envFiles: string[]) => {
  dotenv.config({ path: envFiles });
};
