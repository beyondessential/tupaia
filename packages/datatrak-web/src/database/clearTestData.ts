import { DatatrakWebModelRegistry } from '../types';

export const clearDatabase = async (models: DatatrakWebModelRegistry) => {
  await models.database.executeSql(`
    DO $$ 
    DECLARE 
        r RECORD;
    BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
        LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
    END $$;
  `);

  await models.database.executeSql(`
    DO $$ 
    DECLARE 
        r RECORD;
    BEGIN
        FOR r IN (
            SELECT typname 
            FROM pg_type 
            WHERE typtype = 'e' 
            AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        ) 
        LOOP
            EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
        END LOOP;
    END $$;
  `);

  await models.database.executeSql(`
    DROP SCHEMA IF EXISTS sync_snapshots CASCADE;
  `);

  await models.database.executeSql(`
    DROP SCHEMA IF EXISTS logs CASCADE;
  `);
};
