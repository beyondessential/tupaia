/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// See https://rmp135.github.io/sql-ts/#/?id=totypescript

import sqlts from '@rmp135/sql-ts';

import Knex from 'knex';
// @ts-ignore
import config from './config/config.json';

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
  // @ts-ignore
  const tsString = await sqlts.toTypeScript(config, db);
  fs.writeFile(config.filename, tsString, () => {
    console.log(`File written: ${config.filename}`);
    process.exit(0);
  });
};

run();
