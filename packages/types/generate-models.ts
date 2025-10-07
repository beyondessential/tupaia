// See https://rmp135.github.io/sql-ts/#/?id=totypescript

import sqlts, { Table } from '@rmp135/sql-ts';
import path from 'path';

import Knex from 'knex';
// @ts-ignore
import config from './config/models/config.json';

import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({
  path: [path.resolve(__dirname, '../../env/db.env'), path.resolve(__dirname, '.env')],
  override: true,
});

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

const removeUpdatedAtSyncTickColumn = (tables: Table[]) =>
  tables.map(({ columns, ...restOfTable }) => ({
    ...restOfTable,
    columns: columns.filter(({ name }) => name !== 'updated_at_sync_tick'),
  }));

const makeColumnsOptional = (tables: Table[]): Table[] =>
  tables.map(({ columns, ...restOfTable }) => ({
    ...restOfTable,
    columns: columns.map(col => ({ ...col, optional: true })),
  }));

const makeDefaultColumnsRequired = (tables: Table[]): Table[] =>
  tables.map(({ columns, ...restOfTable }) => ({
    ...restOfTable,
    columns: columns.map(col => ({
      ...col,
      optional: !col.nullable && col.defaultValue !== undefined ? false : col.optional,
    })),
  }));

const removeUnwantedColumns = (tables: Table[]) =>
  tables.map(({ columns, ...restOfTable }) => ({
    ...restOfTable,
    columns: columns.filter(({ name }) => !name.includes('m_row$')), // Remove mvrefresh columns
  }));

/**
 * @description There is currently no way to rename just one enum definition in the sql-ts library, so we have to do it manually. This is so that we can set columns of type entity_type to be EntityTypeEnum + string
 */
const renameEntityTypeEnumDefinition = (enums: any) => {
  return enums.map((enumDef: any) => {
    if (enumDef.name === 'entity_type') {
      return {
        ...enumDef,
        convertedName: 'EntityTypeEnum',
      };
    }
    return enumDef;
  });
};

const generateCreateTables = (tables: Table[]) => {
  const renamedTables = renameTables(tables, 'Create');
  const createTables = removeIdColumn(renamedTables);
  return removeUpdatedAtSyncTickColumn(createTables);
};

const generateUpdateTables = (tables: Table[]) => {
  const renamedTables = renameTables(tables, 'Update');
  const updateTables = makeColumnsOptional(renamedTables);
  return removeUpdatedAtSyncTickColumn(updateTables);
};

const run = async () => {
  const failOnChanges = process.argv[2] === '--failOnChanges';

  // @ts-ignore
  const definitions = await sqlts.toObject(config, db);

  const enums = renameEntityTypeEnumDefinition(definitions.enums);

  // Base Model tables should mark columns with defaultValues as non-optional since the default value will be present
  const baseTables = makeDefaultColumnsRequired(definitions.tables);

  // ModelCreate tables don't require an id column as one will be generated at create time
  const createTables = generateCreateTables(definitions.tables);

  // ModelUpdate tables have all fields as optional since we are just updating an existing record
  const updateTables = generateUpdateTables(definitions.tables);

  const allTables = removeUnwantedColumns(combineTables(baseTables, createTables, updateTables));

  const tsString = sqlts.fromObject({ ...definitions, enums, tables: allTables }, config);

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
