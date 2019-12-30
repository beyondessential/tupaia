/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import DBMigrate from 'db-migrate';
import {} from 'dotenv/config'; // Load the environment variables into process.env
import { CONNECTION_CONFIG } from './TupaiaDatabase';

(async () => {
  const migrationInstance = DBMigrate.getInstance(true, {
    cwd: `${__dirname}/migrations`,
    config: {
      defaultEnv: 'tupaiaConfigServer',
      tupaiaConfigServer: {
        driver: 'pg',
        ...CONNECTION_CONFIG,
      },
    },
  });
  migrationInstance.run();
})();
