/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
// @ts-ignore
import dotenv from '@dotenvx/dotenvx';

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
  console.log(process.env);
};
