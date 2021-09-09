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

exports.up = async function (db) {
  await db.runSql(`
    CREATE OR REPLACE FUNCTION drop_analytics_table() RETURNS void AS $$
    declare
      tStartTime TIMESTAMP;
    
    begin
      RAISE NOTICE 'Dropping analytics materialized view...';
      IF (SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename   = 'analytics'
      ))
      THEN
        tStartTime := clock_timestamp();
        PERFORM mv$removeMaterializedView('analytics', 'public');
        RAISE NOTICE 'Dropped analytics table, took %', clock_timestamp() - tStartTime;
      ELSE
        RAISE NOTICE 'Analytics Materialized View does not exist, skipping';
      END IF;
    end $$ LANGUAGE plpgsql;
  `);

  await db.runSql(`
    CREATE OR REPLACE FUNCTION drop_analytics_log_tables() RETURNS void AS $$
    declare
      tStartTime TIMESTAMP;
      source_table TEXT;
      source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_source'];
    
    begin
      IF (SELECT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename   = 'analytics'
      ))
      THEN
        RAISE NOTICE 'Must drop analytics table before dropping log tables. Run drop_analytics_table()';
      ELSE
        RAISE NOTICE 'Dropping Materialized View Logs...';
        FOREACH source_table IN ARRAY source_tables_array LOOP
          IF (SELECT EXISTS (
            SELECT FROM pg_tables
            WHERE schemaname = 'public'
            AND tablename   = 'log$_' || source_table
          ))
          THEN
            EXECUTE 'ALTER TABLE ' || source_table || ' DISABLE TRIGGER ' || source_table || '_trigger';
            tStartTime := clock_timestamp();
            PERFORM mv$removeMaterializedViewLog(source_table, 'public');
            RAISE NOTICE 'Dropped Materialized View Log for % table, took %', source_table, clock_timestamp() - tStartTime;
            EXECUTE 'ALTER TABLE ' || source_table || ' ENABLE TRIGGER ' || source_table || '_trigger';
          ELSE
            RAISE NOTICE 'Materialized View Log for % table does not exist, skipping', source_table;
          END IF;
        END LOOP;
      END IF;
    end $$ LANGUAGE plpgsql;
  `);

  await db.runSql(`
    CREATE OR REPLACE FUNCTION build_analytics_table(force BOOLEAN default FALSE) RETURNS void AS $$
    declare
      tStartTime TIMESTAMP;
      source_table TEXT;
      source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_source'];
      pSqlStatement TEXT := '
        SELECT
          entity.code as entity_code,
          entity.name as entity_name,
          question.code as data_element_code,
          survey.code as data_group_code,
          survey_response.id as event_id,
          answer.text as value,
          question.type as type,
          to_char(survey_response.data_time, ''YYYYMMDD'') as "day_period",
          concat(extract (isoyear from survey_response.data_time), ''W'', to_char(extract (week from survey_response.data_time), ''FM09'')) as "week_period",
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
          data_source ON data_source.id = question.data_source_id
        WHERE data_source.service_type = ''tupaia'' AND survey_response.outdated IS FALSE';
    
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
          PERFORM mv$createMaterializedViewlog(source_table, 'public');
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
    end $$ LANGUAGE plpgsql;
  `);

  await db.runSql(`
    CREATE OR REPLACE FUNCTION create_analytics_table_indexes() RETURNS void AS $$ 
      declare
        tStartTime TIMESTAMP;
        tAnalyticsIndexName TEXT := 'analytics_data_element_entity_date_idx';
        tEventsIndexName TEXT := 'analytics_data_group_entity_event_date_idx';
      
      begin
        RAISE NOTICE 'Creating analytics table indexes...';
        
        IF (SELECT count(*) = 0
          FROM pg_class c
          WHERE c.relname = tAnalyticsIndexName 
          AND c.relkind = 'i')
        THEN
          tStartTime := clock_timestamp();
          PERFORM mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', tAnalyticsIndexName, 'data_element_code, entity_code, date desc');
          RAISE NOTICE 'Created analytics index, took %', clock_timestamp() - tStartTime;
        ELSE
          RAISE NOTICE 'Analytics index already exists, skipping';
        END IF;
      
        IF (SELECT count(*) = 0
          FROM pg_class c
          WHERE c.relname = tEventsIndexName 
          AND c.relkind = 'i')
        THEN
          tStartTime := clock_timestamp();
          PERFORM mv$addIndexToMv$Table(mv$buildAllConstants(), 'public', 'analytics', tEventsIndexName, 'data_group_code, entity_code, event_id, date desc');
          RAISE NOTICE 'Created events index, took %', clock_timestamp() - tStartTime;
        ELSE
          RAISE NOTICE 'Events index already exists, skipping';
        END IF;
      
      end $$ LANGUAGE plpgsql;
  `);

  await db.runSql(`
    CREATE OR REPLACE FUNCTION drop_analytics_table_indexes() RETURNS void AS $$
      declare
        tStartTime TIMESTAMP;
        tAnalyticsIndexName TEXT := 'analytics_data_element_entity_date_idx';
        tEventsIndexName TEXT := 'analytics_data_group_entity_event_date_idx';
      
      begin
        RAISE NOTICE 'Dropping analytics table indexes...';
      
        IF (SELECT count(*) > 0
          FROM pg_class c
          WHERE c.relname = tAnalyticsIndexName 
          AND c.relkind = 'i')
        THEN
          tStartTime := clock_timestamp();
          PERFORM mv$removeIndexFromMv$Table(mv$buildAllConstants(), tAnalyticsIndexName);
          RAISE NOTICE 'Dropped analytics index, took %', clock_timestamp() - tStartTime;
        ELSE
          RAISE NOTICE 'Analytics index doesn''t exist, skipping';
        END IF;
      
        IF (SELECT count(*) > 0
          FROM pg_class c
          WHERE c.relname = tEventsIndexName 
          AND c.relkind = 'i')
        THEN
          tStartTime := clock_timestamp();
          PERFORM mv$removeIndexFromMv$Table(mv$buildAllConstants(), tEventsIndexName);
          RAISE NOTICE 'Dropped events index, took %', clock_timestamp() - tStartTime;
        ELSE
          RAISE NOTICE 'Events index doesn''t exist, skipping';
        END IF;
      
      end $$ LANGUAGE plpgsql;
  `);

  // Force rebuild the analytics table so it uses the period formats
  await db.runSql('SELECT build_analytics_table(true);');
  await db.runSql('SELECT create_analytics_table_indexes();');
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
