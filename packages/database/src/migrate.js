/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getDbMigrator } from './getDbMigrator';
import { configureEnv } from './configureEnv';

configureEnv();

const migrator = getDbMigrator(true);
migrator.run();
