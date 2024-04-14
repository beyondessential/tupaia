/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import dotenv from 'dotenv';

export const configureDotEnv = (envFiles: string[]) => {
  const filesThatExistInSystem = envFiles.filter(file => {
    try {
      require.resolve(file);
      return true;
    } catch (error) {
      return false;
    }
  });
  dotenv.config({ path: filesThatExistInSystem, override: true });
};
