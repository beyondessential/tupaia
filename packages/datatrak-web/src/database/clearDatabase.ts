import { SqlQuery } from '@tupaia/database';
import { DatatrakWebModelRegistry } from '../types';

const TABLES_TO_KEEP = ['user_account'];

const clearTypes = async (models: DatatrakWebModelRegistry, schema: string) => {
  await models.database.executeSql(
    `
    DO $$ 
    DECLARE 
        r RECORD;
    BEGIN
        FOR r IN (
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e' 
            AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = ?)
        ) 
        LOOP
            EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
    END $$;
  `,
    [schema],
  );
};

const clearTables = async (
  models: DatatrakWebModelRegistry,
  schema: string,
  tablesToKeep: string[] = [],
) => {
  await models.database.executeSql(
    `
    DO $$ 
    DECLARE 
        r RECORD;
    BEGIN
        FOR r IN (
          SELECT tablename FROM pg_tables 
          WHERE schemaname = ?
          ${tablesToKeep.length > 0 ? `AND tablename NOT IN ${SqlQuery.record(tablesToKeep)}` : ''}
        )
        LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;
  `,
    [schema, ...(tablesToKeep.length > 0 ? tablesToKeep : [])],
  );
};

export const clearDatabase = async (models: DatatrakWebModelRegistry) => {
  // Clear public schema but still keep some tables
  await clearTables(models, 'public', TABLES_TO_KEEP);
  await clearTypes(models, 'public');

  // Drop sync_snapshots schema
  await models.database.executeSql(`
    DROP SCHEMA IF EXISTS sync_snapshots CASCADE;
  `);

  // Drop logs schema
  await models.database.executeSql(`
    DROP SCHEMA IF EXISTS logs CASCADE;
  `);
};
