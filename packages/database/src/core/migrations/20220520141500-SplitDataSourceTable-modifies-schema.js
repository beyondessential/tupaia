'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const updateForeignKey = async (db, tableName, columnName, oldFKTable, newFKTable) => {
  // Drop current foreign key constraint
  // Change to new values
  // Add foreign key constraint
  // The particular name of the constraint depends on the system setup, so just allow for both
  await db.runSql(`
    ALTER TABLE ${tableName}
    DROP CONSTRAINT IF EXISTS data_element_data_group_data_group_id_fk;
    ALTER TABLE ${tableName}
    DROP CONSTRAINT IF EXISTS data_element_data_group_data_group_id_fkey;

    UPDATE ${tableName}
    SET ${columnName} = ${newFKTable}.id
    FROM ${newFKTable}
    INNER JOIN ${oldFKTable}
      ON ${newFKTable}.code = ${oldFKTable}.code
    WHERE ${oldFKTable}.id = ${columnName};

    ALTER TABLE ${tableName}
    ADD FOREIGN KEY (${columnName})
    REFERENCES ${newFKTable}(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE;
  `);
};

const updateAndRenameForeignKey = async (
  db,
  tableName,
  oldFKTable,
  oldFKColumn,
  newFKTable,
  newFKColumn,
) => {
  // Add new column
  // Fill new column with values
  // Add foreign key constraint
  // Drop original column
  await db.runSql(`
    ALTER TABLE ${tableName}
    ADD COLUMN ${newFKColumn} TEXT;

    UPDATE ${tableName}
    SET ${newFKColumn} = ${newFKTable}.id
    FROM ${newFKTable}
    INNER JOIN ${oldFKTable}
      ON ${newFKTable}.code = ${oldFKTable}.code
    WHERE ${oldFKTable}.id = ${oldFKColumn};

    ALTER TABLE ${tableName}
    ADD FOREIGN KEY (${newFKColumn})
    REFERENCES ${newFKTable}(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

    ALTER TABLE ${tableName}
    DROP COLUMN ${oldFKColumn};
  `);
};

exports.up = async function (db) {
  // Create new table for data groups
  await db.runSql(`
    CREATE TABLE data_group (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      service_type service_type NOT NULL,
      config JSONB NOT NULL DEFAULT '{}'
    );
  `);
  // Copy data groups info into new table
  await db.runSql(`
    INSERT INTO data_group (id, code, service_type, config)
    SELECT generate_object_id(), code, service_type, config
    FROM data_source
    WHERE type = 'dataGroup';
  `);
  // Update foreign keys that refer to data groups
  await updateForeignKey(
    db,
    'data_element_data_group',
    'data_group_id',
    'data_source',
    'data_group',
  );
  await updateAndRenameForeignKey(
    db,
    'survey',
    'data_source',
    'data_source_id',
    'data_group',
    'data_group_id',
  );

  // Drop data groups from data source table
  // Drop type column since it's no longer relevant
  await db.runSql(`
    DELETE FROM data_source
    WHERE type = 'dataGroup';

    ALTER TABLE data_source
    DROP COLUMN type;
  `);

  // Rename data_source table to data_element
  await db.runSql(`
    ALTER TABLE data_source
    RENAME TO data_element
  `);
  // Rename foreign keys
  await db.runSql(`
    ALTER TABLE question
    RENAME COLUMN data_source_id TO data_element_id
  `);
  // Drop the now incorrectly named trigger
  // A new one will be automatically created post migration
  await db.runSql(`
    DROP TRIGGER IF EXISTS data_source_trigger ON data_element
  `);

  await updateAnalytics(db, 'data_element', 'data_source');
};

exports.down = async function (db) {
  // Rename data_element table back to data_source
  await db.runSql(`
    ALTER TABLE data_element
    RENAME TO data_source
  `);
  // Rename foreign keys
  await db.runSql(`
    ALTER TABLE question
    RENAME COLUMN data_element_id TO data_source_id
  `);
  // Drop the now incorrectly named trigger
  // A new one will be automatically created post migration
  await db.runSql(`
    DROP TRIGGER IF EXISTS data_element_trigger ON data_source
  `);

  // Add type column back into data_source table
  await db.runSql(`
    ALTER TABLE data_source
    ADD COLUMN type data_source_type;

    UPDATE data_source
    SET type = 'dataElement';

    ALTER TABLE data_source
    ALTER COLUMN type SET NOT NULL;
  `);
  // Move data groups info back into data_source table
  await db.runSql(`
    INSERT INTO data_source (id, code, service_type, config, type)
    SELECT generate_object_id(), code, service_type, config, 'dataGroup'
    FROM data_group;
  `);
  // Update foreign keys back to data_source table
  await updateForeignKey(
    db,
    'data_element_data_group',
    'data_group_id',
    'data_group',
    'data_source',
  );
  await updateAndRenameForeignKey(
    db,
    'survey',
    'data_group',
    'data_group_id',
    'data_source',
    'data_source_id',
  );
  // Drop the data_group table
  await db.runSql(`
    DROP TABLE data_group;
  `);

  await updateAnalytics(db, 'data_source', 'data_element');
};

exports._meta = {
  version: 1,
};

const updateAnalytics = async (db, newTableName, oldTableName) => {
  await db.runSql(`
    CREATE OR REPLACE FUNCTION build_analytics_table(force BOOLEAN default FALSE) RETURNS void AS $$
    declare
      tStartTime TIMESTAMP;
      source_table TEXT;
      source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', '${newTableName}'];
      pSqlStatement TEXT := '
        SELECT
          entity.code as entity_code,
          entity.name as entity_name,
          question.code as data_element_code,
          survey.code as data_group_code,
          survey_response.id as event_id,
          CASE 
            WHEN question.type = ''Binary'' OR question.type = ''Checkbox'' 
            THEN CASE 
              WHEN answer.text = ''Yes'' THEN ''1'' 
              ELSE ''0'' 
            END 
            ELSE answer.text
          END as value,
          question.type as type,
          to_char(survey_response.data_time, ''YYYYMMDD'') as "day_period",
          concat(
            extract (isoyear from survey_response.data_time), 
            ''W'', 
            to_char(extract (week from survey_response.data_time), ''FM09'')) 
          as "week_period",
          to_char(survey_response.data_time, ''YYYYMM'') as "month_period",
          to_char(survey_response.data_time, ''YYYY'') as "year_period",
          survey_response.data_time as "date"
        FROM
          survey_response
        INNER JOIN
          answer ON answer.survey_response_id = survey_response.id
        INNER JOIN
          entity ON entity.id = survey_response.entity_id
        INNER JOIN
          survey ON survey.id = survey_response.survey_id
        INNER JOIN
          question ON question.id = answer.question_id
        INNER JOIN
          ${newTableName} ON ${newTableName}.id = question.${newTableName}_id
        WHERE ${newTableName}.service_type = ''tupaia'' AND survey_response.outdated IS FALSE AND survey_response.approval_status IN (''not_required'', ''approved'')';
    
    begin
      RAISE NOTICE 'Creating Materialized View Logs...';
    
      FOREACH source_table IN ARRAY source_tables_array LOOP
        IF (SELECT NOT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename   = 'log$_' || source_table
        ))
        THEN
          EXECUTE 'ALTER TABLE ' || source_table || ' DISABLE TRIGGER ' || source_table || '_trigger';
          tStartTime := clock_timestamp();
          PERFORM mv$createMaterializedViewLog(source_table, 'public');
          RAISE NOTICE 'Created Materialized View Log for % table, took %', source_table, clock_timestamp() - tStartTime;
          EXECUTE 'ALTER TABLE ' || source_table || ' ENABLE TRIGGER ' || source_table || '_trigger';
        ELSE
          RAISE NOTICE 'Materialized View Log for % table already exists, skipping', source_table;
        END IF;
      END LOOP;
    
    
      RAISE NOTICE 'Creating analytics materialized view...';
      IF (SELECT NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename   = 'analytics'
      ))
      THEN
        tStartTime := clock_timestamp();
        PERFORM mv$createMaterializedView(
            pViewName           => 'analytics',
            pSelectStatement    =>  pSqlStatement,
            pOwner              => 'public',
            pFastRefresh        =>  TRUE
        );
        RAISE NOTICE 'Created analytics table, took %', clock_timestamp() - tStartTime;
      ELSE
        IF (force)
        THEN
        RAISE NOTICE 'Force rebuilding analytics table';
          tStartTime := clock_timestamp();
          PERFORM mv$createMaterializedView(
              pViewName           => 'analytics_tmp',
              pSelectStatement    =>  pSqlStatement,
              pOwner              => 'public',
              pFastRefresh        =>  TRUE
          );
          RAISE NOTICE 'Created analytics table, took %', clock_timestamp() - tStartTime;
          PERFORM mv$removeMaterializedView('analytics', 'public');
          PERFORM mv$renameMaterializedView('analytics_tmp', 'analytics', 'public');
        ELSE
          RAISE NOTICE 'Analytics Materialized View already exists, skipping';
        END IF;
      END IF;
    end $$ LANGUAGE plpgsql
  `);

  // Force rebuild is required to integrate this change with the analytics table
  await db.runSql(`SELECT mv$renameMaterializedViewLog('${oldTableName}', '${newTableName}')`);
  await db.runSql('SELECT build_analytics_table(true);');
  await db.runSql('SELECT create_analytics_table_indexes();');
};
