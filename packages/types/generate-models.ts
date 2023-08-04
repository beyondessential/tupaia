/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// See https://rmp135.github.io/sql-ts/#/?id=totypescript

import sqlts from '@rmp135/sql-ts';

import Knex from 'knex';
// @ts-ignore
import config from './config/models/config.json';

import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const db = Knex({
  client: 'postgresql',
  connection: {
    host: process.env.DB_URL,
    port: (process.env.DB_PORT as any) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

const run = async () => {
  const failOnChanges = process.argv[2] === '--failOnChanges';

  // @ts-ignore
  const tsString = await sqlts.toTypeScript(config, db);

  if (failOnChanges) {
    const currentTsString = fs.readFileSync(config.filename, { encoding: 'utf8' });
    if (currentTsString !== tsString) {
      console.log("❌ There are changes in the db schema which are not reflected in @tupaia/types.")
      console.log("Run 'yarn workspace @tupaia/types generate' to fix")
      process.exit(1);
    }
  }

  fs.writeFile(config.filename, tsString, () => {
    console.log(`File written: ${config.filename}`);
    process.exit(0);
  });
};

run();
