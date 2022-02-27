/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import {} from 'dotenv/config'; // Load the environment variables into process.env
import { getDbMigrator } from './getDbMigrator';

const migrator = getDbMigrator(true);
migrator.run();
