/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

// See https://rmp135.github.io/sql-ts/#/?id=totypescript

import sqlts, { Table } from '@rmp135/sql-ts';

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

const renameTables = (tables: Table[], suffix: string) =>
  tables.map(table => ({
    ...table,
    interfaceName: `${table.interfaceName}${suffix}`,
  }));

const combineTables = (baseTables: Table[], createTables: Table[], updateTables: Table[]) => {
  const combinedTables: Table[] = [];
  for (let i = 0; i < baseTables.length; i++) {
    combinedTables.push(baseTables[i], createTables[i], updateTables[i]);
  }
  return combinedTables;
};

const removeIdColumn = (tables: Table[]) =>
  tables.map(({ columns, ...restOfTable }) => ({
    ...restOfTable,
    columns: columns.filter(({ name }) => name !== 'id'),
  }));

const makeColumnsOptional = (tables: Table[]): Table[] =>
  tables.map(({ columns, ...restOfTable }) => ({
    ...restOfTable,
    columns: columns.map(col => ({ ...col, optional: true })),
  }));

const removeUnwantedColumns = (tables: Table[]) =>
  tables.map(({ columns, ...restOfTable }) => ({
    ...restOfTable,
    columns: columns.filter(({ name }) => !name.includes('m_row$')), // Remove mvrefresh columns
  }));

const run = async () => {
  const failOnChanges = process.argv[2] === '--failOnChanges';

  // @ts-ignore
  const definitions = await sqlts.toObject(config, db);

  // ModelCreate tables don't require an id column as one will be generated at create time
  const createTables = removeIdColumn(renameTables(definitions.tables, 'Create'));

  // ModelUpdate tables have all fields as optional since we are just updating an existing record
  const updateTables = makeColumnsOptional(renameTables(definitions.tables, 'Update'));

  const allTables = removeUnwantedColumns(
    combineTables(definitions.tables, createTables, updateTables),
  );

  const tsString = sqlts.fromObject({ ...definitions, tables: allTables }, config);

  if (failOnChanges) {
    const currentTsString = fs.readFileSync(config.filename, { encoding: 'utf8' });
    if (currentTsString !== tsString) {
      console.log(
        '❌ There are changes in the db schema which are not reflected in @tupaia/types.',
      );
      console.log("Run 'yarn workspace @tupaia/types generate' to fix");
      process.exit(1);
    }
  }

  fs.writeFile(config.filename, tsString, () => {
    console.log(`File written: ${config.filename}`);
    process.exit(0);
  });
};

run();
