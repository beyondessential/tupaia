--
-- PostgreSQL database dump
--

-- Dumped from database version 13.13
-- Dumped by pg_dump version 14.11 (Ubuntu 14.11-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: approval_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.approval_status AS ENUM (
    'not_required',
    'pending',
    'rejected',
    'approved'
);


--
-- Name: data_source_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.data_source_type AS ENUM (
    'dataElement',
    'dataGroup'
);


--
-- Name: data_table_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.data_table_type AS ENUM (
    'analytics',
    'events',
    'entity_relations',
    'entities',
    'sql',
    'data_group_metadata',
    'data_element_metadata',
    'entity_attributes',
    'survey_responses'
);


--
-- Name: entity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.entity_type AS ENUM (
    'world',
    'project',
    'country',
    'district',
    'sub_district',
    'facility',
    'village',
    'case',
    'case_contact',
    'disaster',
    'school',
    'catchment',
    'sub_catchment',
    'field_station',
    'city',
    'individual',
    'sub_facility',
    'postcode',
    'household',
    'larval_habitat',
    'local_government',
    'medical_area',
    'nursing_zone',
    'fetp_graduate',
    'incident',
    'incident_reported',
    'fiji_aspen_facility',
    'wish_sub_district',
    'trap',
    'asset',
    'institute',
    'msupply_store',
    'complaint',
    'water_sample',
    'facility_building',
    'facility_division',
    'facility_section',
    'hospital_ward',
    'farm',
    'repair_request',
    'district_operational',
    'commune',
    'business',
    'health_clinic_boundary',
    'enumeration_area',
    'maintenance',
    'larval_sample',
    'transfer'
);


--
-- Name: period_granularity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.period_granularity AS ENUM (
    'yearly',
    'quarterly',
    'monthly',
    'weekly',
    'daily'
);


--
-- Name: primary_platform; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.primary_platform AS ENUM (
    'tupaia',
    'lesmis',
    'datatrak'
);


--
-- Name: question_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.question_type AS ENUM (
    'Arithmetic',
    'Autocomplete',
    'Binary',
    'Checkbox',
    'CodeGenerator',
    'Condition',
    'Date',
    'DateOfData',
    'DateTime',
    'Entity',
    'FreeText',
    'Geolocate',
    'Instruction',
    'Number',
    'Photo',
    'PrimaryEntity',
    'Radio',
    'SubmissionDate',
    'File'
);


--
-- Name: service_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.service_type AS ENUM (
    'dhis',
    'tupaia',
    'indicator',
    'weather',
    'kobo',
    'data-lake',
    'superset'
);


--
-- Name: sync_group_sync_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.sync_group_sync_status AS ENUM (
    'IDLE',
    'SYNCING',
    'ERROR'
);


--
-- Name: value_and_date; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.value_and_date AS (
	value text,
	date timestamp without time zone
);


--
-- Name: verified_email; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.verified_email AS ENUM (
    'unverified',
    'new_user',
    'verified'
);


--
-- Name: build_analytics_table(boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.build_analytics_table(force boolean DEFAULT false) RETURNS void
    LANGUAGE plpgsql
    AS $_X$
declare
  tStartTime TIMESTAMP;
  source_table TEXT;
  source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_element'];
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
        WHEN question.type = ''Entity''
        THEN answer_entity.name
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
    LEFT JOIN
      entity answer_entity ON answer_entity.id = answer.text
    INNER JOIN
      survey ON survey.id = survey_response.survey_id
    INNER JOIN
      question ON question.id = answer.question_id
    INNER JOIN
      data_element ON data_element.id = question.data_element_id
    WHERE data_element.service_type = ''tupaia'' AND survey_response.outdated IS FALSE AND survey_response.approval_status IN (''not_required'', ''approved'')';

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
end $_X$;


--
-- Name: create_analytics_table_indexes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_analytics_table_indexes() RETURNS void
    LANGUAGE plpgsql
    AS $_$ 
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
      
      end $_$;


--
-- Name: create_user_and_role(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_user_and_role(pis_password text, pis_moduleowner text) RETURNS void
    LANGUAGE plpgsql
    AS $_X$
DECLARE

ls_password TEXT := pis_password;

ls_moduleowner TEXT := pis_moduleowner;

ls_sql TEXT;

BEGIN
 IF NOT EXISTS (
      SELECT
      FROM   pg_user
      WHERE  usename = pis_moduleowner) THEN
	  
	  ls_sql := 'CREATE USER '||ls_moduleowner||' WITH
					LOGIN
					NOSUPERUSER
					NOCREATEDB
					NOCREATEROLE
					INHERIT
					NOREPLICATION
					CONNECTION LIMIT -1
					PASSWORD '''||pis_password||''';';
				
	  EXECUTE ls_sql;
	  
   END IF;
   
   IF NOT EXISTS (
      SELECT
      FROM   pg_roles
      WHERE  rolname = 'pgmv$_role') THEN
	  
	  ls_sql := 'CREATE ROLE pgmv$_role WITH
				  NOLOGIN
				  NOSUPERUSER
				  INHERIT
				  NOCREATEDB
				  NOCREATEROLE
				  NOREPLICATION;';
				
	  EXECUTE ls_sql;
	  
   END IF;
   
   IF NOT EXISTS (
      SELECT
      FROM   pg_roles
      WHERE  rolname = 'rds_superuser') THEN
	  
	  ls_sql := 'ALTER USER '||pis_moduleowner||' with superuser;';
				
	  EXECUTE ls_sql;
	  
   ELSE
	
	  ls_sql := 'GRANT rds_superuser TO '||pis_moduleowner||';';
	  
	  EXECUTE ls_sql;
	  
   END IF;

END;
$_X$;


--
-- Name: drop_analytics_log_tables(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.drop_analytics_log_tables() RETURNS void
    LANGUAGE plpgsql
    AS $_X$
declare
  tStartTime TIMESTAMP;
  source_table TEXT;
  source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_element'];

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
end $_X$;


--
-- Name: drop_analytics_table(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.drop_analytics_table() RETURNS void
    LANGUAGE plpgsql
    AS $_$
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
    end $_$;


--
-- Name: drop_analytics_table_indexes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.drop_analytics_table_indexes() RETURNS void
    LANGUAGE plpgsql
    AS $_$
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
      
      end $_$;


--
-- Name: generate_object_id(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_object_id() RETURNS character varying
    LANGUAGE plpgsql
    AS $$
        DECLARE
            time_component bigint;
            machine_id bigint := FLOOR(random() * 16777215);
            process_id bigint;
            seq_id bigint := FLOOR(random() * 16777215);
            result varchar:= '';
        BEGIN
            SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp())) INTO time_component;
            SELECT pg_backend_pid() INTO process_id;

            result := result || lpad(to_hex(time_component), 8, '0');
            result := result || lpad(to_hex(machine_id), 6, '0');
            result := result || lpad(to_hex(process_id), 4, '0');
            result := result || lpad(to_hex(seq_id), 6, '0');
            RETURN result;
        END;
      $$;


--
-- Name: immutable_table(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.immutable_table() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
        IF TG_OP = 'UPDATE' AND OLD <> NEW THEN
          RAISE EXCEPTION 'Cannot update immutable table';
        END IF;
      END
    $$;


--
-- Name: most_recent_final_fn(public.value_and_date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.most_recent_final_fn(public.value_and_date) RETURNS text
    LANGUAGE sql
    AS $_$
      SELECT $1.value;
  $_$;


--
-- Name: most_recent_fn(public.value_and_date, text, timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.most_recent_fn(public.value_and_date, text, timestamp without time zone) RETURNS public.value_and_date
    LANGUAGE sql
    AS $_$
    SELECT 
      case
        when $3 > $1.date then ($2, $3)::value_and_date 
        else $1
      end
  $_$;


--
-- Name: notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.notification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
    new_json_record JSONB;
    old_json_record JSONB;
    record_id TEXT;
    change_type TEXT;
    BEGIN

    -- if nothing has changed, no need to trigger a notification
    IF TG_OP = 'UPDATE' AND OLD = NEW THEN
      RETURN NULL;
    END IF;

    -- set the change_type from the less readable TG_OP
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      change_type := 'update';
    ELSE
      change_type := 'delete';
    END IF;

    -- set up the old and new records
    IF TG_OP <> 'INSERT' THEN
      old_json_record := public.scrub_geo_data(
        to_jsonb(OLD),
        TG_TABLE_NAME
      );
    END IF;
    IF TG_OP <> 'DELETE' THEN
      new_json_record := public.scrub_geo_data(
        to_jsonb(NEW),
        TG_TABLE_NAME
      );
    END IF;

    IF change_type = 'update' THEN
      record_id := NEW.id;
    ELSE
      record_id := OLD.id;
    END IF;

    -- publish change notification
    PERFORM pg_notify(
      'change',
      json_build_object(
        'record_type',
        TG_TABLE_NAME,
        'record_id',
        record_id,
        'type',
        change_type,
        'old_record',
        old_json_record,
        'new_record',
        new_json_record
      )::text
    );

    -- return the appropriate record to allow the trigger to pass
    IF change_type = 'update' THEN
      RETURN NEW;
    ELSE
      RETURN OLD;
    END IF;

    END;
    $$;


--
-- Name: schema_change_notification(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.schema_change_notification() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
  PERFORM pg_notify('schema_change', 'schema_change');
  END;
  $$;


--
-- Name: scrub_geo_data(jsonb, name); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.scrub_geo_data(current_record jsonb DEFAULT NULL::jsonb, tg_table_name name DEFAULT NULL::name) RETURNS json
    LANGUAGE plpgsql
    AS $$
    DECLARE
      geo_entities RECORD;
    BEGIN
      IF current_record IS NULL THEN
        RETURN '{}';
      END IF;
      FOR geo_entities IN
        SELECT f_table_name, f_geography_column
        FROM geography_columns
        WHERE type in ('Polygon', 'MultiPolygon')
        AND f_table_name = TG_TABLE_NAME LOOP
          -- will remove columns with geo data
          current_record := current_record::jsonb - geo_entities.f_geography_column;
      END LOOP;
    RETURN current_record;
    END;
    $$;


--
-- Name: array_concat_agg(anyarray); Type: AGGREGATE; Schema: public; Owner: -
--

CREATE AGGREGATE public.array_concat_agg(anyarray) (
    SFUNC = array_cat,
    STYPE = anyarray
);


--
-- Name: most_recent(text, timestamp without time zone); Type: AGGREGATE; Schema: public; Owner: -
--

CREATE AGGREGATE public.most_recent(text, timestamp without time zone) (
    SFUNC = public.most_recent_fn,
    STYPE = public.value_and_date,
    INITCOND = '(NULL,-infinity)',
    FINALFUNC = public.most_recent_final_fn
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: access_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.access_request (
    id text NOT NULL,
    user_id text,
    entity_id text,
    message text,
    project_id text,
    permission_group_id text,
    approved boolean,
    created_time timestamp with time zone DEFAULT now() NOT NULL,
    processed_by text,
    note text,
    processed_date timestamp with time zone
);


--
-- Name: admin_panel_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_panel_session (
    id text NOT NULL,
    email text NOT NULL,
    access_policy jsonb NOT NULL,
    access_token text NOT NULL,
    access_token_expiry bigint NOT NULL,
    refresh_token text NOT NULL
);


--
-- Name: ancestor_descendant_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ancestor_descendant_relation (
    id text NOT NULL,
    entity_hierarchy_id text NOT NULL,
    ancestor_id text NOT NULL,
    descendant_id text NOT NULL,
    generational_distance integer NOT NULL
);


--
-- Name: answer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.answer (
    id text NOT NULL,
    type text NOT NULL,
    survey_response_id text NOT NULL,
    question_id text NOT NULL,
    text text
);


--
-- Name: api_client; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_client (
    id text NOT NULL,
    username text NOT NULL,
    secret_key_hash text NOT NULL,
    user_account_id text
);


--
-- Name: api_request_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.api_request_log (
    id text NOT NULL,
    version double precision NOT NULL,
    endpoint text NOT NULL,
    user_id text,
    request_time timestamp without time zone DEFAULT now(),
    query jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    refresh_token text,
    api text NOT NULL,
    method text
);


--
-- Name: change_time_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.change_time_seq
    START WITH 100
    INCREMENT BY 1
    MINVALUE 100
    MAXVALUE 999
    CACHE 1
    CYCLE;


--
-- Name: clinic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clinic (
    id text NOT NULL,
    name text NOT NULL,
    country_id text NOT NULL,
    geographical_area_id text NOT NULL,
    code text NOT NULL,
    type text,
    category_code character varying(3),
    type_name character varying(30)
);


--
-- Name: comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment (
    id text NOT NULL,
    user_id text,
    created_time timestamp with time zone DEFAULT now() NOT NULL,
    last_modified_time timestamp with time zone DEFAULT now() NOT NULL,
    text text NOT NULL
);


--
-- Name: country; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.country (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL
);


--
-- Name: dashboard; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboard (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    root_entity_code text NOT NULL,
    sort_order integer
);


--
-- Name: dashboard_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboard_item (
    id text NOT NULL,
    code text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    report_code text,
    legacy boolean DEFAULT false NOT NULL,
    permission_group_ids text[],
    CONSTRAINT check_code_equals_report_code CHECK (((legacy = true) OR (code = report_code)))
);


--
-- Name: dashboard_mailing_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboard_mailing_list (
    id text NOT NULL,
    project_id text NOT NULL,
    entity_id text NOT NULL,
    dashboard_id text NOT NULL,
    admin_permission_groups text[] DEFAULT '{}'::text[] NOT NULL
);


--
-- Name: dashboard_mailing_list_entry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboard_mailing_list_entry (
    id text NOT NULL,
    dashboard_mailing_list_id text NOT NULL,
    email text NOT NULL,
    subscribed boolean DEFAULT true NOT NULL,
    unsubscribed_time timestamp without time zone
);


--
-- Name: dashboard_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dashboard_relation (
    id text NOT NULL,
    dashboard_id text NOT NULL,
    child_id text NOT NULL,
    entity_types public.entity_type[] NOT NULL,
    project_codes text[] NOT NULL,
    permission_groups text[] NOT NULL,
    sort_order integer,
    attributes_filter jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT entity_types_not_empty CHECK ((entity_types <> '{}'::public.entity_type[])),
    CONSTRAINT permission_groups_not_empty CHECK ((permission_groups <> '{}'::text[])),
    CONSTRAINT project_codes_not_empty CHECK ((project_codes <> '{}'::text[]))
);


--
-- Name: data_element; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_element (
    id text NOT NULL,
    code text NOT NULL,
    service_type public.service_type NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    permission_groups text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT valid_data_service_config CHECK (((service_type <> 'dhis'::public.service_type) OR ((config ->> 'dhisInstanceCode'::text) IS NOT NULL)))
);


--
-- Name: data_element_data_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_element_data_group (
    id text NOT NULL,
    data_element_id text NOT NULL,
    data_group_id text NOT NULL
);


--
-- Name: data_element_data_service; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_element_data_service (
    id text NOT NULL,
    data_element_code text NOT NULL,
    country_code text NOT NULL,
    service_type public.service_type NOT NULL,
    service_config jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT valid_data_service_config CHECK (((service_type <> 'dhis'::public.service_type) OR ((service_config ->> 'dhisInstanceCode'::text) IS NOT NULL)))
);


--
-- Name: data_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_group (
    id text NOT NULL,
    code text NOT NULL,
    service_type public.service_type NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT valid_data_service_config CHECK (((service_type <> 'dhis'::public.service_type) OR ((config ->> 'dhisInstanceCode'::text) IS NOT NULL)))
);


--
-- Name: data_service_entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_service_entity (
    id text NOT NULL,
    entity_code text NOT NULL,
    config jsonb NOT NULL
);


--
-- Name: data_service_sync_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_service_sync_group (
    id text NOT NULL,
    code text NOT NULL,
    service_type public.service_type NOT NULL,
    config jsonb NOT NULL,
    data_group_code text NOT NULL,
    sync_cursor text DEFAULT '1970-01-01T00:00:00.000Z'::text,
    sync_status public.sync_group_sync_status DEFAULT 'IDLE'::public.sync_group_sync_status
);


--
-- Name: data_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.data_table (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    permission_groups text[] NOT NULL,
    type public.data_table_type NOT NULL
);


--
-- Name: datatrak_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.datatrak_session (
    id text NOT NULL,
    email text NOT NULL,
    access_policy jsonb NOT NULL,
    access_token text NOT NULL,
    access_token_expiry bigint NOT NULL,
    refresh_token text NOT NULL
);


--
-- Name: dhis_instance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dhis_instance (
    id text NOT NULL,
    code text NOT NULL,
    readonly boolean NOT NULL,
    config jsonb NOT NULL
);


--
-- Name: dhis_sync_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dhis_sync_log (
    id text NOT NULL,
    record_id text NOT NULL,
    record_type text NOT NULL,
    imported double precision DEFAULT 0,
    updated double precision DEFAULT 0,
    deleted double precision DEFAULT 0,
    ignored double precision DEFAULT 0,
    error_list text,
    data text,
    dhis_reference text
);


--
-- Name: dhis_sync_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dhis_sync_queue (
    id text NOT NULL,
    type text NOT NULL,
    record_type text NOT NULL,
    record_id text NOT NULL,
    details text DEFAULT '{}'::text,
    change_time double precision DEFAULT (floor((date_part('epoch'::text, clock_timestamp()) * (1000)::double precision)) + ((nextval('public.change_time_seq'::regclass))::double precision / (100)::double precision)),
    priority integer DEFAULT 1,
    is_dead_letter boolean DEFAULT false,
    bad_request_count integer DEFAULT 0,
    is_deleted boolean DEFAULT false
);


--
-- Name: entity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity (
    id character varying(64) NOT NULL,
    code character varying(64) NOT NULL,
    parent_id character varying(64),
    name character varying(128) NOT NULL,
    type public.entity_type NOT NULL,
    point public.geography(Point,4326),
    region public.geography(MultiPolygon,4326),
    image_url text,
    country_code character varying(6),
    bounds public.geography(Polygon,4326),
    metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    attributes jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: entity_hierarchy; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_hierarchy (
    id text NOT NULL,
    name text NOT NULL,
    canonical_types text[] DEFAULT '{}'::text[]
);


--
-- Name: entity_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.entity_relation (
    id text NOT NULL,
    parent_id text NOT NULL,
    child_id text NOT NULL,
    entity_hierarchy_id text NOT NULL
);


--
-- Name: error_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_log (
    id text NOT NULL,
    message text,
    api_request_log_id text,
    type text,
    error_time timestamp without time zone DEFAULT now()
);


--
-- Name: external_database_connection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_database_connection (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    permission_groups text[] DEFAULT '{}'::text[] NOT NULL
);


--
-- Name: feed_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feed_item (
    id text NOT NULL,
    country_id text,
    geographical_area_id text,
    user_id text,
    permission_group_id text,
    type text,
    record_id text,
    template_variables json,
    creation_date timestamp without time zone DEFAULT now()
);


--
-- Name: geographical_area; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.geographical_area (
    id text NOT NULL,
    name text NOT NULL,
    level_code text NOT NULL,
    level_name text NOT NULL,
    country_id text NOT NULL,
    parent_id text,
    code text
);


--
-- Name: indicator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.indicator (
    id text NOT NULL,
    code text NOT NULL,
    builder text NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: landing_page; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.landing_page (
    id text NOT NULL,
    name character varying(40) NOT NULL,
    url_segment text NOT NULL,
    image_url text,
    logo_url text,
    primary_hexcode text,
    secondary_hexcode text,
    extended_title text,
    long_bio text,
    contact_us text,
    external_link text,
    phone_number text,
    website_url text,
    include_name_in_header boolean,
    project_codes text[]
);


--
-- Name: legacy_report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.legacy_report (
    id text NOT NULL,
    code text NOT NULL,
    data_builder text,
    data_builder_config jsonb,
    data_services jsonb DEFAULT '[{"isDataRegional": true}]'::jsonb
);


--
-- Name: lesmis_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesmis_session (
    id text NOT NULL,
    email text NOT NULL,
    access_policy jsonb NOT NULL,
    access_token text NOT NULL,
    access_token_expiry bigint NOT NULL,
    refresh_token text NOT NULL
);


--
-- Name: map_overlay; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_overlay (
    code text NOT NULL,
    name text NOT NULL,
    permission_group text NOT NULL,
    linked_measures text[],
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    country_codes text[],
    project_codes text[] DEFAULT '{}'::text[],
    report_code text,
    legacy boolean DEFAULT false NOT NULL,
    data_services jsonb DEFAULT '[{"isDataRegional": true}]'::jsonb,
    id text DEFAULT public.generate_object_id() NOT NULL,
    entity_attributes_filter jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: mapOverlay_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."mapOverlay_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mapOverlay_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."mapOverlay_id_seq" OWNED BY public.map_overlay.code;


--
-- Name: map_overlay_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_overlay_group (
    id text NOT NULL,
    name text NOT NULL,
    code text NOT NULL
);


--
-- Name: map_overlay_group_relation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.map_overlay_group_relation (
    id text NOT NULL,
    map_overlay_group_id text NOT NULL,
    child_id text NOT NULL,
    child_type text NOT NULL,
    sort_order integer
);


--
-- Name: meditrak_device; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meditrak_device (
    id text NOT NULL,
    user_id text NOT NULL,
    install_id text NOT NULL,
    platform character varying DEFAULT ''::character varying,
    app_version text,
    config jsonb DEFAULT '{}'::jsonb
);


--
-- Name: meditrak_sync_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meditrak_sync_queue (
    id text NOT NULL,
    type text NOT NULL,
    record_type text NOT NULL,
    record_id text NOT NULL,
    change_time double precision DEFAULT (floor((date_part('epoch'::text, clock_timestamp()) * (1000)::double precision)) + ((nextval('public.change_time_seq'::regclass))::double precision / (100)::double precision))
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: ms1_sync_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ms1_sync_log (
    id text NOT NULL,
    record_type text NOT NULL,
    record_id text NOT NULL,
    count integer DEFAULT 1,
    error_list text,
    endpoint text,
    data text
);


--
-- Name: ms1_sync_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ms1_sync_queue (
    id text NOT NULL,
    type text NOT NULL,
    record_type text NOT NULL,
    record_id text NOT NULL,
    priority integer DEFAULT 1,
    details text,
    is_dead_letter boolean DEFAULT false,
    bad_request_count integer DEFAULT 0,
    change_time double precision DEFAULT (floor((date_part('epoch'::text, clock_timestamp()) * (1000)::double precision)) + ((nextval('public.change_time_seq'::regclass))::double precision / (100)::double precision)),
    is_deleted boolean DEFAULT false
);


--
-- Name: one_time_login; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.one_time_login (
    id text NOT NULL,
    user_id text NOT NULL,
    token text NOT NULL,
    creation_date timestamp with time zone DEFAULT now(),
    use_date timestamp with time zone
);


--
-- Name: option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option (
    id text NOT NULL,
    value text NOT NULL,
    label text,
    sort_order integer,
    option_set_id text NOT NULL,
    attributes jsonb DEFAULT '{}'::jsonb
);


--
-- Name: option_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.option_set (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: permission_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permission_group (
    id text NOT NULL,
    name text NOT NULL,
    parent_id text
);


--
-- Name: project; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project (
    id text NOT NULL,
    code text NOT NULL,
    description text,
    sort_order integer,
    image_url text,
    default_measure text DEFAULT '126,171'::text,
    dashboard_group_name text DEFAULT 'General'::text,
    permission_groups text[] DEFAULT '{}'::text[] NOT NULL,
    logo_url text,
    entity_id text,
    entity_hierarchy_id text,
    config jsonb DEFAULT '{"permanentRegionLabels": true}'::jsonb NOT NULL
);


--
-- Name: psss_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.psss_session (
    id text NOT NULL,
    email text NOT NULL,
    access_policy jsonb NOT NULL,
    access_token text NOT NULL,
    access_token_expiry bigint NOT NULL,
    refresh_token text NOT NULL
);


--
-- Name: question; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.question (
    id text NOT NULL,
    text text NOT NULL,
    name text,
    options text[],
    code text,
    detail text,
    option_set_id character varying,
    hook text,
    data_element_id text,
    type public.question_type NOT NULL
);


--
-- Name: refresh_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_token (
    id text NOT NULL,
    user_id text NOT NULL,
    device text,
    token text NOT NULL,
    expiry double precision,
    meditrak_device_id text
);


--
-- Name: report; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.report (
    id text NOT NULL,
    code text NOT NULL,
    config jsonb NOT NULL,
    permission_group_id text NOT NULL,
    latest_data_parameters jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: setting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.setting (
    id text NOT NULL,
    key text NOT NULL,
    value text
);


--
-- Name: superset_instance; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.superset_instance (
    id text NOT NULL,
    code text NOT NULL,
    config jsonb NOT NULL
);


--
-- Name: survey; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey (
    id text NOT NULL,
    name text NOT NULL,
    code character varying(30) NOT NULL,
    permission_group_id text,
    country_ids text[] DEFAULT '{}'::text[],
    can_repeat boolean DEFAULT false,
    survey_group_id text,
    integration_metadata jsonb DEFAULT '{}'::jsonb,
    period_granularity public.period_granularity,
    requires_approval boolean DEFAULT false,
    data_group_id text,
    project_id text NOT NULL
);


--
-- Name: survey_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_group (
    id text NOT NULL,
    name text NOT NULL
);


--
-- Name: survey_response; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_response (
    id text NOT NULL,
    survey_id text NOT NULL,
    user_id text NOT NULL,
    assessor_name text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    metadata text,
    timezone text DEFAULT 'Pacific/Auckland'::text,
    entity_id text NOT NULL,
    data_time timestamp without time zone,
    outdated boolean DEFAULT false,
    approval_status public.approval_status DEFAULT 'not_required'::public.approval_status
);


--
-- Name: survey_response_comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_response_comment (
    id text NOT NULL,
    survey_response_id text NOT NULL,
    comment_id text NOT NULL
);


--
-- Name: survey_screen; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_screen (
    id text NOT NULL,
    survey_id text NOT NULL,
    screen_number double precision NOT NULL
);


--
-- Name: survey_screen_component; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.survey_screen_component (
    id text NOT NULL,
    question_id text NOT NULL,
    screen_id text NOT NULL,
    component_number double precision NOT NULL,
    answers_enabling_follow_up text[] DEFAULT '{}'::text[],
    is_follow_up boolean DEFAULT false,
    visibility_criteria character varying,
    validation_criteria character varying,
    question_label text,
    detail_label text,
    config character varying DEFAULT '{}'::character varying
);


--
-- Name: sync_group_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sync_group_log (
    id text NOT NULL,
    sync_group_code text NOT NULL,
    service_type public.service_type NOT NULL,
    log_message text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT timezone('UTC'::text, now())
);


--
-- Name: tupaia_web_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tupaia_web_session (
    id text NOT NULL,
    email text NOT NULL,
    access_policy jsonb NOT NULL,
    access_token text NOT NULL,
    access_token_expiry bigint NOT NULL,
    refresh_token text NOT NULL
);


--
-- Name: userSession; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."userSession" (
    id text NOT NULL,
    "userName" text NOT NULL,
    "accessToken" text,
    "refreshToken" text NOT NULL,
    "accessPolicy" jsonb,
    access_token_expiry bigint DEFAULT 0 NOT NULL
);


--
-- Name: user_account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_account (
    id text NOT NULL,
    first_name text,
    last_name text,
    email text NOT NULL,
    gender text,
    creation_date timestamp with time zone DEFAULT now(),
    employer text,
    "position" text,
    mobile_number text,
    password_hash text NOT NULL,
    password_salt text NOT NULL,
    verified_email public.verified_email DEFAULT 'new_user'::public.verified_email,
    profile_image text,
    primary_platform public.primary_platform DEFAULT 'tupaia'::public.primary_platform,
    preferences jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: user_entity_permission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_entity_permission (
    id text NOT NULL,
    user_id text NOT NULL,
    entity_id text NOT NULL,
    permission_group_id text NOT NULL
);


--
-- Name: user_favourite_dashboard_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favourite_dashboard_item (
    id text NOT NULL,
    user_id text NOT NULL,
    dashboard_item_id text NOT NULL
);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: meditrak_sync_queue meditrak_sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meditrak_sync_queue
    ADD CONSTRAINT meditrak_sync_queue_pkey PRIMARY KEY (id);


--
-- Name: permissions_based_meditrak_sync_queue; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.permissions_based_meditrak_sync_queue AS
 SELECT msq.id,
    msq.type,
    msq.record_type,
    msq.record_id,
    msq.change_time,
    max(e.type) AS entity_type,
    COALESCE(NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(co.id)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(e_co.id)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(c.country_id)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(ga.country_id)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(public.array_concat_agg(s.country_ids)) AS unnest), '{}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(public.array_concat_agg(sg_s.country_ids)) AS unnest), '{}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(public.array_concat_agg(ss_s.country_ids)) AS unnest), '{}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(public.array_concat_agg(ssc_ss_s.country_ids)) AS unnest), '{}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(public.array_concat_agg(q_ssc_ss_s.country_ids)) AS unnest), '{}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(public.array_concat_agg(os_q_ssc_ss_s.country_ids)) AS unnest), '{}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(public.array_concat_agg(o_os_q_ssc_ss_s.country_ids)) AS unnest), '{}'::text[])) AS country_ids,
    COALESCE(NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(pg.name)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(s_pg.name)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(sg_s_pg.name)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(ss_s_pg.name)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(ssc_ss_s_pg.name)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(q_ssc_ss_s_pg.name)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(os_q_ssc_ss_s_pg.name)) AS unnest), '{NULL}'::text[]), NULLIF(ARRAY( SELECT DISTINCT unnest(array_agg(o_os_q_ssc_ss_s_pg.name)) AS unnest), '{NULL}'::text[])) AS permission_groups
   FROM ((((((((((((((((((((((((((((((((((((public.meditrak_sync_queue msq
     LEFT JOIN public.country co ON ((msq.record_id = co.id)))
     LEFT JOIN public.entity e ON ((msq.record_id = (e.id)::text)))
     LEFT JOIN public.country e_co ON ((e_co.code = (e.country_code)::text)))
     LEFT JOIN public.clinic c ON ((msq.record_id = c.id)))
     LEFT JOIN public.geographical_area ga ON ((msq.record_id = ga.id)))
     LEFT JOIN public.permission_group pg ON ((msq.record_id = pg.id)))
     LEFT JOIN public.survey s ON ((msq.record_id = s.id)))
     LEFT JOIN public.permission_group s_pg ON ((s.permission_group_id = s_pg.id)))
     LEFT JOIN public.survey_group sg ON ((msq.record_id = sg.id)))
     LEFT JOIN public.survey sg_s ON ((sg_s.survey_group_id = sg.id)))
     LEFT JOIN public.permission_group sg_s_pg ON ((sg_s.permission_group_id = sg_s_pg.id)))
     LEFT JOIN public.survey_screen ss ON ((msq.record_id = ss.id)))
     LEFT JOIN public.survey ss_s ON ((ss.survey_id = ss_s.id)))
     LEFT JOIN public.permission_group ss_s_pg ON ((ss_s.permission_group_id = ss_s_pg.id)))
     LEFT JOIN public.survey_screen_component ssc ON ((msq.record_id = ssc.id)))
     LEFT JOIN public.survey_screen ssc_ss ON ((ssc.screen_id = ssc_ss.id)))
     LEFT JOIN public.survey ssc_ss_s ON ((ssc_ss.survey_id = ssc_ss_s.id)))
     LEFT JOIN public.permission_group ssc_ss_s_pg ON ((ssc_ss_s.permission_group_id = ssc_ss_s_pg.id)))
     LEFT JOIN public.question q ON ((msq.record_id = q.id)))
     LEFT JOIN public.survey_screen_component q_ssc ON ((q_ssc.question_id = q.id)))
     LEFT JOIN public.survey_screen q_ssc_ss ON ((q_ssc.screen_id = q_ssc_ss.id)))
     LEFT JOIN public.survey q_ssc_ss_s ON ((q_ssc_ss.survey_id = q_ssc_ss_s.id)))
     LEFT JOIN public.permission_group q_ssc_ss_s_pg ON ((q_ssc_ss_s.permission_group_id = q_ssc_ss_s_pg.id)))
     LEFT JOIN public.option_set os ON ((msq.record_id = os.id)))
     LEFT JOIN public.question os_q ON (((os_q.option_set_id)::text = os.id)))
     LEFT JOIN public.survey_screen_component os_q_ssc ON ((os_q_ssc.question_id = os_q.id)))
     LEFT JOIN public.survey_screen os_q_ssc_ss ON ((os_q_ssc.screen_id = os_q_ssc_ss.id)))
     LEFT JOIN public.survey os_q_ssc_ss_s ON ((os_q_ssc_ss.survey_id = os_q_ssc_ss_s.id)))
     LEFT JOIN public.permission_group os_q_ssc_ss_s_pg ON ((os_q_ssc_ss_s.permission_group_id = os_q_ssc_ss_s_pg.id)))
     LEFT JOIN public.option o ON ((msq.record_id = o.id)))
     LEFT JOIN public.option_set o_os ON ((o.option_set_id = o_os.id)))
     LEFT JOIN public.question o_os_q ON (((o_os_q.option_set_id)::text = o_os.id)))
     LEFT JOIN public.survey_screen_component o_os_q_ssc ON ((o_os_q_ssc.question_id = o_os_q.id)))
     LEFT JOIN public.survey_screen o_os_q_ssc_ss ON ((o_os_q_ssc.screen_id = o_os_q_ssc_ss.id)))
     LEFT JOIN public.survey o_os_q_ssc_ss_s ON ((o_os_q_ssc_ss.survey_id = o_os_q_ssc_ss_s.id)))
     LEFT JOIN public.permission_group o_os_q_ssc_ss_s_pg ON ((o_os_q_ssc_ss_s.permission_group_id = o_os_q_ssc_ss_s_pg.id)))
  GROUP BY msq.id
  WITH NO DATA;


--
-- Name: access_request access_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_request
    ADD CONSTRAINT access_request_pkey PRIMARY KEY (id);


--
-- Name: admin_panel_session admin_panel_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_panel_session
    ADD CONSTRAINT admin_panel_session_pkey PRIMARY KEY (id);


--
-- Name: ancestor_descendant_relation ancestor_descendant_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ancestor_descendant_relation
    ADD CONSTRAINT ancestor_descendant_relation_pkey PRIMARY KEY (id);


--
-- Name: answer answer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_pkey PRIMARY KEY (id);


--
-- Name: answer answer_survey_response_id_question_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_survey_response_id_question_id_unique UNIQUE (survey_response_id, question_id);


--
-- Name: api_client api_client_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_client
    ADD CONSTRAINT api_client_pkey PRIMARY KEY (id);


--
-- Name: api_client api_client_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_client
    ADD CONSTRAINT api_client_username_key UNIQUE (username);


--
-- Name: api_request_log api_request_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_request_log
    ADD CONSTRAINT api_request_log_pkey PRIMARY KEY (id);


--
-- Name: clinic clinic_code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT clinic_code UNIQUE (code);


--
-- Name: clinic clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT clinic_pkey PRIMARY KEY (id);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: country country_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_code_key UNIQUE (code);


--
-- Name: country country_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_name_key UNIQUE (name);


--
-- Name: country country_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pkey PRIMARY KEY (id);


--
-- Name: dashboard dashboard_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard
    ADD CONSTRAINT dashboard_code_key UNIQUE (code);


--
-- Name: dashboard_mailing_list dashboard_id_project_id_entity_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list
    ADD CONSTRAINT dashboard_id_project_id_entity_id_unique UNIQUE (dashboard_id, project_id, entity_id);


--
-- Name: dashboard_item dashboard_item_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_item
    ADD CONSTRAINT dashboard_item_code_key UNIQUE (code);


--
-- Name: dashboard_item dashboard_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_item
    ADD CONSTRAINT dashboard_item_pkey PRIMARY KEY (id);


--
-- Name: dashboard_mailing_list_entry dashboard_mailing_list_entry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list_entry
    ADD CONSTRAINT dashboard_mailing_list_entry_pkey PRIMARY KEY (id);


--
-- Name: dashboard_mailing_list_entry dashboard_mailing_list_id_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list_entry
    ADD CONSTRAINT dashboard_mailing_list_id_email_unique UNIQUE (dashboard_mailing_list_id, email);


--
-- Name: dashboard_mailing_list dashboard_mailing_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list
    ADD CONSTRAINT dashboard_mailing_list_pkey PRIMARY KEY (id);


--
-- Name: dashboard dashboard_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard
    ADD CONSTRAINT dashboard_pkey PRIMARY KEY (id);


--
-- Name: dashboard_relation dashboard_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_relation
    ADD CONSTRAINT dashboard_relation_pkey PRIMARY KEY (id);


--
-- Name: data_element_data_group data_element_data_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_element_data_group
    ADD CONSTRAINT data_element_data_group_pkey PRIMARY KEY (id);


--
-- Name: data_element_data_group data_element_data_group_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_element_data_group
    ADD CONSTRAINT data_element_data_group_unique UNIQUE (data_element_id, data_group_id);


--
-- Name: data_element_data_service data_element_data_service_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_element_data_service
    ADD CONSTRAINT data_element_data_service_pkey PRIMARY KEY (id);


--
-- Name: data_group data_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_group
    ADD CONSTRAINT data_group_pkey PRIMARY KEY (id);


--
-- Name: data_service_entity data_service_entity_entity_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_service_entity
    ADD CONSTRAINT data_service_entity_entity_code_key UNIQUE (entity_code);


--
-- Name: data_service_entity data_service_entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_service_entity
    ADD CONSTRAINT data_service_entity_pkey PRIMARY KEY (id);


--
-- Name: data_service_sync_group data_service_sync_group_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_service_sync_group
    ADD CONSTRAINT data_service_sync_group_code_key UNIQUE (code);


--
-- Name: data_service_sync_group data_service_sync_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_service_sync_group
    ADD CONSTRAINT data_service_sync_group_pkey PRIMARY KEY (id);


--
-- Name: data_element data_source_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_element
    ADD CONSTRAINT data_source_pkey PRIMARY KEY (id);


--
-- Name: data_table data_table_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_table
    ADD CONSTRAINT data_table_code_key UNIQUE (code);


--
-- Name: data_table data_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_table
    ADD CONSTRAINT data_table_pkey PRIMARY KEY (id);


--
-- Name: datatrak_session datatrak_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.datatrak_session
    ADD CONSTRAINT datatrak_session_pkey PRIMARY KEY (id);


--
-- Name: dhis_instance dhis_instance_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dhis_instance
    ADD CONSTRAINT dhis_instance_code_key UNIQUE (code);


--
-- Name: dhis_instance dhis_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dhis_instance
    ADD CONSTRAINT dhis_instance_pkey PRIMARY KEY (id);


--
-- Name: dhis_sync_log dhis_sync_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dhis_sync_log
    ADD CONSTRAINT dhis_sync_log_pkey PRIMARY KEY (id);


--
-- Name: dhis_sync_log dhis_sync_log_record_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dhis_sync_log
    ADD CONSTRAINT dhis_sync_log_record_id_unique UNIQUE (record_id);


--
-- Name: dhis_sync_queue dhis_sync_queue_change_time_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dhis_sync_queue
    ADD CONSTRAINT dhis_sync_queue_change_time_key UNIQUE (change_time);


--
-- Name: dhis_sync_queue dhis_sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dhis_sync_queue
    ADD CONSTRAINT dhis_sync_queue_pkey PRIMARY KEY (id);


--
-- Name: dhis_sync_queue dhis_sync_queue_record_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dhis_sync_queue
    ADD CONSTRAINT dhis_sync_queue_record_id_unique UNIQUE (record_id);


--
-- Name: entity entity_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_code_key UNIQUE (code);


--
-- Name: entity_hierarchy entity_hierarchy_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_hierarchy
    ADD CONSTRAINT entity_hierarchy_name_key UNIQUE (name);


--
-- Name: entity_hierarchy entity_hierarchy_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_hierarchy
    ADD CONSTRAINT entity_hierarchy_pkey PRIMARY KEY (id);


--
-- Name: entity entity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_pkey PRIMARY KEY (id);


--
-- Name: entity_relation entity_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_relation
    ADD CONSTRAINT entity_relation_pkey PRIMARY KEY (id);


--
-- Name: error_log error_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_log
    ADD CONSTRAINT error_log_pkey PRIMARY KEY (id);


--
-- Name: external_database_connection external_database_connection_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_database_connection
    ADD CONSTRAINT external_database_connection_code_key UNIQUE (code);


--
-- Name: external_database_connection external_database_connection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_database_connection
    ADD CONSTRAINT external_database_connection_pkey PRIMARY KEY (id);


--
-- Name: feed_item feed_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_item
    ADD CONSTRAINT feed_item_pkey PRIMARY KEY (id);


--
-- Name: geographical_area geographical_area_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geographical_area
    ADD CONSTRAINT geographical_area_pkey PRIMARY KEY (id);


--
-- Name: indicator indicator_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indicator
    ADD CONSTRAINT indicator_code_key UNIQUE (code);


--
-- Name: indicator indicator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.indicator
    ADD CONSTRAINT indicator_pkey PRIMARY KEY (id);


--
-- Name: meditrak_device install_id_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meditrak_device
    ADD CONSTRAINT install_id_pkey PRIMARY KEY (id);


--
-- Name: landing_page landing_page_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.landing_page
    ADD CONSTRAINT landing_page_pkey PRIMARY KEY (id);


--
-- Name: legacy_report legacy_report_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legacy_report
    ADD CONSTRAINT legacy_report_code_key UNIQUE (code);


--
-- Name: legacy_report legacy_report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.legacy_report
    ADD CONSTRAINT legacy_report_pkey PRIMARY KEY (id);


--
-- Name: lesmis_session lesmis_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesmis_session
    ADD CONSTRAINT lesmis_session_pkey PRIMARY KEY (id);


--
-- Name: map_overlay mapOverlay_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_overlay
    ADD CONSTRAINT "mapOverlay_id_key" UNIQUE (code);


--
-- Name: map_overlay_group map_overlay_group_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_overlay_group
    ADD CONSTRAINT map_overlay_group_code_key UNIQUE (code);


--
-- Name: map_overlay_group map_overlay_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_overlay_group
    ADD CONSTRAINT map_overlay_group_pkey PRIMARY KEY (id);


--
-- Name: map_overlay_group_relation map_overlay_group_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_overlay_group_relation
    ADD CONSTRAINT map_overlay_group_relation_pkey PRIMARY KEY (id);


--
-- Name: map_overlay map_overlay_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_overlay
    ADD CONSTRAINT map_overlay_pkey PRIMARY KEY (id);


--
-- Name: meditrak_device meditrak_device_install_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meditrak_device
    ADD CONSTRAINT meditrak_device_install_id_unique UNIQUE (install_id);


--
-- Name: meditrak_sync_queue meditrak_sync_queue_change_time_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meditrak_sync_queue
    ADD CONSTRAINT meditrak_sync_queue_change_time_key UNIQUE (change_time);


--
-- Name: meditrak_sync_queue meditrak_sync_queue_record_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meditrak_sync_queue
    ADD CONSTRAINT meditrak_sync_queue_record_id_unique UNIQUE (record_id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: ms1_sync_log ms1_sync_log_record_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ms1_sync_log
    ADD CONSTRAINT ms1_sync_log_record_id_unique UNIQUE (record_id);


--
-- Name: ms1_sync_queue ms1_sync_queue_record_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ms1_sync_queue
    ADD CONSTRAINT ms1_sync_queue_record_id_unique UNIQUE (record_id);


--
-- Name: one_time_login one_time_login_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.one_time_login
    ADD CONSTRAINT one_time_login_pkey PRIMARY KEY (id);


--
-- Name: one_time_login one_time_login_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.one_time_login
    ADD CONSTRAINT one_time_login_token_key UNIQUE (token);


--
-- Name: option option_option_set_id_value_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT option_option_set_id_value_unique UNIQUE (option_set_id, value);


--
-- Name: option option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT option_pkey PRIMARY KEY (id);


--
-- Name: option_set option_set_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_set
    ADD CONSTRAINT option_set_name_key UNIQUE (name);


--
-- Name: option_set option_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option_set
    ADD CONSTRAINT option_set_pkey PRIMARY KEY (id);


--
-- Name: permission_group permission_group_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_name_key UNIQUE (name);


--
-- Name: permission_group permission_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_pkey PRIMARY KEY (id);


--
-- Name: project project_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_code_key UNIQUE (code);


--
-- Name: project project_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pkey PRIMARY KEY (id);


--
-- Name: psss_session psss_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.psss_session
    ADD CONSTRAINT psss_session_pkey PRIMARY KEY (id);


--
-- Name: question question_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_code_unique UNIQUE (code);


--
-- Name: question question_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_pkey PRIMARY KEY (id);


--
-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


--
-- Name: refresh_token refresh_token_user_id_device_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_user_id_device_unique UNIQUE (user_id, device);


--
-- Name: report report_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_code_key UNIQUE (code);


--
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);


--
-- Name: setting setting_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT setting_key_key UNIQUE (key);


--
-- Name: setting setting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.setting
    ADD CONSTRAINT setting_pkey PRIMARY KEY (id);


--
-- Name: superset_instance superset_instance_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superset_instance
    ADD CONSTRAINT superset_instance_code_key UNIQUE (code);


--
-- Name: superset_instance superset_instance_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.superset_instance
    ADD CONSTRAINT superset_instance_pkey PRIMARY KEY (id);


--
-- Name: survey survey_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_code_unique UNIQUE (code);


--
-- Name: survey_group survey_group_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_group
    ADD CONSTRAINT survey_group_name_key UNIQUE (name);


--
-- Name: survey_group survey_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_group
    ADD CONSTRAINT survey_group_pkey PRIMARY KEY (id);


--
-- Name: survey survey_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_name_key UNIQUE (name);


--
-- Name: survey survey_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_pkey PRIMARY KEY (id);


--
-- Name: survey_response_comment survey_response_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_response_comment
    ADD CONSTRAINT survey_response_comment_pkey PRIMARY KEY (id);


--
-- Name: survey_response survey_response_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_response
    ADD CONSTRAINT survey_response_pkey PRIMARY KEY (id);


--
-- Name: survey_screen_component survey_screen_component_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_screen_component
    ADD CONSTRAINT survey_screen_component_pkey PRIMARY KEY (id);


--
-- Name: survey_screen survey_screen_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_screen
    ADD CONSTRAINT survey_screen_pkey PRIMARY KEY (id);


--
-- Name: sync_group_log sync_service_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sync_group_log
    ADD CONSTRAINT sync_service_log_pkey PRIMARY KEY (id);


--
-- Name: tupaia_web_session tupaia_web_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tupaia_web_session
    ADD CONSTRAINT tupaia_web_session_pkey PRIMARY KEY (id);


--
-- Name: userSession userSession_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userSession"
    ADD CONSTRAINT "userSession_id_key" UNIQUE (id);


--
-- Name: userSession userSession_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."userSession"
    ADD CONSTRAINT "userSession_pkey" PRIMARY KEY ("userName");


--
-- Name: user_account user_account_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_email_key UNIQUE (email);


--
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);


--
-- Name: user_entity_permission user_entity_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_entity_permission
    ADD CONSTRAINT user_entity_permission_pkey PRIMARY KEY (id);


--
-- Name: user_favourite_dashboard_item user_favourite_dashboard_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favourite_dashboard_item
    ADD CONSTRAINT user_favourite_dashboard_item_pkey PRIMARY KEY (id);


--
-- Name: user_favourite_dashboard_item user_favourite_dashboard_item_user_id_dashboard_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favourite_dashboard_item
    ADD CONSTRAINT user_favourite_dashboard_item_user_id_dashboard_item_id_key UNIQUE (user_id, dashboard_item_id);


--
-- Name: ancestor_descendant_relation_ancestor_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ancestor_descendant_relation_ancestor_id_idx ON public.ancestor_descendant_relation USING btree (ancestor_id);


--
-- Name: ancestor_descendant_relation_descendant_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ancestor_descendant_relation_descendant_id_idx ON public.ancestor_descendant_relation USING btree (descendant_id);


--
-- Name: answer_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_question_id_idx ON public.answer USING btree (question_id);


--
-- Name: answer_survey_response_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_survey_response_id_idx ON public.answer USING btree (survey_response_id);


--
-- Name: answer_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX answer_type_idx ON public.answer USING btree (type);


--
-- Name: clinic_country_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clinic_country_id_idx ON public.clinic USING btree (country_id);


--
-- Name: clinic_geographical_area_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clinic_geographical_area_id_idx ON public.clinic USING btree (geographical_area_id);


--
-- Name: dhis_sync_log_record_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dhis_sync_log_record_id_idx ON public.dhis_sync_log USING btree (record_id);


--
-- Name: dhis_sync_log_record_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dhis_sync_log_record_type_idx ON public.dhis_sync_log USING btree (record_type);


--
-- Name: dhis_sync_queue_change_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dhis_sync_queue_change_time_idx ON public.dhis_sync_queue USING btree (change_time);


--
-- Name: dhis_sync_queue_record_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dhis_sync_queue_record_id_idx ON public.dhis_sync_queue USING btree (record_id);


--
-- Name: dhis_sync_queue_record_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX dhis_sync_queue_record_type_idx ON public.dhis_sync_queue USING btree (record_type);


--
-- Name: entity_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_code ON public.entity USING btree (code);


--
-- Name: entity_parent_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX entity_parent_id_key ON public.entity USING btree (parent_id);


--
-- Name: geographical_area_country_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX geographical_area_country_id_idx ON public.geographical_area USING btree (country_id);


--
-- Name: geographical_area_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX geographical_area_parent_id_idx ON public.geographical_area USING btree (parent_id);


--
-- Name: idx_entity_country_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_entity_country_code ON public.entity USING btree (country_code);


--
-- Name: meditrak_sync_queue_change_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meditrak_sync_queue_change_time_idx ON public.meditrak_sync_queue USING btree (change_time);


--
-- Name: meditrak_sync_queue_record_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX meditrak_sync_queue_record_id_idx ON public.meditrak_sync_queue USING btree (record_id);


--
-- Name: permission_group_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permission_group_name_idx ON public.permission_group USING btree (name);


--
-- Name: permission_group_parent_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX permission_group_parent_id_idx ON public.permission_group USING btree (parent_id);


--
-- Name: permissions_based_meditrak_sync_queue_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX permissions_based_meditrak_sync_queue_id_idx ON public.permissions_based_meditrak_sync_queue USING btree (id);


--
-- Name: question_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX question_code_idx ON public.question USING btree (code);


--
-- Name: refresh_token_token_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_token_token_idx ON public.refresh_token USING btree (token);


--
-- Name: refresh_token_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_token_user_id_idx ON public.refresh_token USING btree (user_id);


--
-- Name: setting_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX setting_key_idx ON public.setting USING btree (key);


--
-- Name: survey_code_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_code_idx ON public.survey USING btree (code);


--
-- Name: survey_group_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_group_name_idx ON public.survey_group USING btree (name);


--
-- Name: survey_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_name_idx ON public.survey USING btree (name);


--
-- Name: survey_permission_group_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_permission_group_id_idx ON public.survey USING btree (permission_group_id);


--
-- Name: survey_project_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_project_id_idx ON public.survey USING btree (project_id);


--
-- Name: survey_response_data_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_response_data_time_idx ON public.survey_response USING btree (data_time DESC);


--
-- Name: survey_response_end_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_response_end_time_idx ON public.survey_response USING btree (end_time);


--
-- Name: survey_response_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_response_entity_id_idx ON public.survey_response USING btree (entity_id);


--
-- Name: survey_response_outdated_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_response_outdated_id_idx ON public.survey_response USING btree (outdated);


--
-- Name: survey_response_start_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_response_start_time_idx ON public.survey_response USING btree (start_time);


--
-- Name: survey_response_survey_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_response_survey_id_idx ON public.survey_response USING btree (survey_id);


--
-- Name: survey_response_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_response_user_id_idx ON public.survey_response USING btree (user_id);


--
-- Name: survey_screen_component_component_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_screen_component_component_number_idx ON public.survey_screen_component USING btree (component_number);


--
-- Name: survey_screen_component_question_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_screen_component_question_id_idx ON public.survey_screen_component USING btree (question_id);


--
-- Name: survey_screen_component_screen_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_screen_component_screen_id_idx ON public.survey_screen_component USING btree (screen_id);


--
-- Name: survey_screen_screen_number_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_screen_screen_number_idx ON public.survey_screen USING btree (screen_number);


--
-- Name: survey_screen_survey_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_screen_survey_id_idx ON public.survey_screen USING btree (survey_id);


--
-- Name: survey_survey_group_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX survey_survey_group_id_idx ON public.survey USING btree (survey_group_id);


--
-- Name: user_account_creation_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_account_creation_date_idx ON public.user_account USING btree (creation_date);


--
-- Name: user_account_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_account_email_idx ON public.user_account USING btree (email);


--
-- Name: user_account_first_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_account_first_name_idx ON public.user_account USING btree (first_name);


--
-- Name: user_account_last_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_account_last_name_idx ON public.user_account USING btree (last_name);


--
-- Name: user_entity_permission_entity_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_entity_permission_entity_id_idx ON public.user_entity_permission USING btree (entity_id);


--
-- Name: user_entity_permission_permission_group_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_entity_permission_permission_group_id_idx ON public.user_entity_permission USING btree (permission_group_id);


--
-- Name: user_entity_permission_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_entity_permission_user_id_idx ON public.user_entity_permission USING btree (user_id);


--
-- Name: user_favourite_dashboard_item_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_favourite_dashboard_item_user_id_idx ON public.user_favourite_dashboard_item USING btree (user_id);


--
-- Name: access_request access_request_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER access_request_trigger AFTER INSERT OR DELETE OR UPDATE ON public.access_request FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: ancestor_descendant_relation ancestor_descendant_relation_immutable_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ancestor_descendant_relation_immutable_trigger AFTER UPDATE ON public.ancestor_descendant_relation FOR EACH ROW EXECUTE FUNCTION public.immutable_table();


--
-- Name: ancestor_descendant_relation ancestor_descendant_relation_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ancestor_descendant_relation_trigger AFTER INSERT OR DELETE OR UPDATE ON public.ancestor_descendant_relation FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: answer answer_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER answer_trigger AFTER INSERT OR DELETE OR UPDATE ON public.answer FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: api_client api_client_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER api_client_trigger AFTER INSERT OR DELETE OR UPDATE ON public.api_client FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: clinic clinic_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER clinic_trigger AFTER INSERT OR DELETE OR UPDATE ON public.clinic FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: comment comment_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER comment_trigger AFTER INSERT OR DELETE OR UPDATE ON public.comment FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: country country_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER country_trigger AFTER INSERT OR DELETE OR UPDATE ON public.country FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: dashboard_item dashboard_item_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dashboard_item_trigger AFTER INSERT OR DELETE OR UPDATE ON public.dashboard_item FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: dashboard_relation dashboard_relation_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dashboard_relation_trigger AFTER INSERT OR DELETE OR UPDATE ON public.dashboard_relation FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: dashboard dashboard_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dashboard_trigger AFTER INSERT OR DELETE OR UPDATE ON public.dashboard FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: data_element_data_group data_element_data_group_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER data_element_data_group_trigger AFTER INSERT OR DELETE OR UPDATE ON public.data_element_data_group FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: data_element_data_service data_element_data_service_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER data_element_data_service_trigger AFTER INSERT OR DELETE OR UPDATE ON public.data_element_data_service FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: data_element data_element_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER data_element_trigger AFTER INSERT OR DELETE OR UPDATE ON public.data_element FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: data_group data_group_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER data_group_trigger AFTER INSERT OR DELETE OR UPDATE ON public.data_group FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: data_service_entity data_service_entity_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER data_service_entity_trigger AFTER INSERT OR DELETE OR UPDATE ON public.data_service_entity FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: dhis_instance dhis_instance_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dhis_instance_trigger AFTER INSERT OR DELETE OR UPDATE ON public.dhis_instance FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: dhis_sync_queue dhis_sync_queue_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER dhis_sync_queue_trigger AFTER INSERT OR DELETE OR UPDATE ON public.dhis_sync_queue FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: entity_hierarchy entity_hierarchy_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER entity_hierarchy_trigger AFTER INSERT OR DELETE OR UPDATE ON public.entity_hierarchy FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: entity_relation entity_relation_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER entity_relation_trigger AFTER INSERT OR DELETE OR UPDATE ON public.entity_relation FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: entity entity_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER entity_trigger AFTER INSERT OR DELETE OR UPDATE ON public.entity FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: external_database_connection external_database_connection_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER external_database_connection_trigger AFTER INSERT OR DELETE OR UPDATE ON public.external_database_connection FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: geographical_area geographical_area_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER geographical_area_trigger AFTER INSERT OR DELETE OR UPDATE ON public.geographical_area FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: indicator indicator_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER indicator_trigger AFTER INSERT OR DELETE OR UPDATE ON public.indicator FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: meditrak_device install_id_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER install_id_trigger AFTER INSERT OR DELETE OR UPDATE ON public.meditrak_device FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: landing_page landing_page_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER landing_page_trigger AFTER INSERT OR DELETE OR UPDATE ON public.landing_page FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: map_overlay_group_relation map_overlay_group_relation_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER map_overlay_group_relation_trigger AFTER INSERT OR DELETE OR UPDATE ON public.map_overlay_group_relation FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: map_overlay_group map_overlay_group_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER map_overlay_group_trigger AFTER INSERT OR DELETE OR UPDATE ON public.map_overlay_group FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: map_overlay map_overlay_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER map_overlay_trigger AFTER INSERT OR DELETE OR UPDATE ON public.map_overlay FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: map_overlay mapoverlay_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER mapoverlay_trigger AFTER INSERT OR DELETE OR UPDATE ON public.map_overlay FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: meditrak_device meditrak_device_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER meditrak_device_trigger AFTER INSERT OR DELETE OR UPDATE ON public.meditrak_device FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: meditrak_sync_queue meditrak_sync_queue_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER meditrak_sync_queue_trigger AFTER INSERT OR DELETE OR UPDATE ON public.meditrak_sync_queue FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: ms1_sync_log ms1_sync_log_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ms1_sync_log_trigger AFTER INSERT OR DELETE OR UPDATE ON public.ms1_sync_log FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: ms1_sync_queue ms1_sync_queue_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ms1_sync_queue_trigger AFTER INSERT OR DELETE OR UPDATE ON public.ms1_sync_queue FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: one_time_login one_time_login_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER one_time_login_trigger AFTER INSERT OR DELETE OR UPDATE ON public.one_time_login FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: option_set option_set_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER option_set_trigger AFTER INSERT OR DELETE OR UPDATE ON public.option_set FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: option option_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER option_trigger AFTER INSERT OR DELETE OR UPDATE ON public.option FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: permission_group permission_group_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER permission_group_trigger AFTER INSERT OR DELETE OR UPDATE ON public.permission_group FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: project project_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER project_trigger AFTER INSERT OR DELETE OR UPDATE ON public.project FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: question question_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER question_trigger AFTER INSERT OR DELETE OR UPDATE ON public.question FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: refresh_token refresh_token_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER refresh_token_trigger AFTER INSERT OR DELETE OR UPDATE ON public.refresh_token FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: setting setting_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER setting_trigger AFTER INSERT OR DELETE OR UPDATE ON public.setting FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: superset_instance superset_instance_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER superset_instance_trigger AFTER INSERT OR DELETE OR UPDATE ON public.superset_instance FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: survey_group survey_group_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER survey_group_trigger AFTER INSERT OR DELETE OR UPDATE ON public.survey_group FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: survey_response_comment survey_response_comment_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER survey_response_comment_trigger AFTER INSERT OR DELETE OR UPDATE ON public.survey_response_comment FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: survey_response survey_response_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER survey_response_trigger AFTER INSERT OR DELETE OR UPDATE ON public.survey_response FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: survey_screen_component survey_screen_component_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER survey_screen_component_trigger AFTER INSERT OR DELETE OR UPDATE ON public.survey_screen_component FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: survey_screen survey_screen_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER survey_screen_trigger AFTER INSERT OR DELETE OR UPDATE ON public.survey_screen FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: survey survey_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER survey_trigger AFTER INSERT OR DELETE OR UPDATE ON public.survey FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: sync_group_log sync_group_log_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_group_log_trigger AFTER INSERT OR DELETE OR UPDATE ON public.sync_group_log FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: sync_group_log sync_service_log_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_service_log_trigger AFTER INSERT OR DELETE OR UPDATE ON public.sync_group_log FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: user_account user_account_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_account_trigger AFTER INSERT OR DELETE OR UPDATE ON public.user_account FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: user_entity_permission user_entity_permission_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_entity_permission_trigger AFTER INSERT OR DELETE OR UPDATE ON public.user_entity_permission FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: user_favourite_dashboard_item user_favourite_dashboard_item_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER user_favourite_dashboard_item_trigger AFTER INSERT OR DELETE OR UPDATE ON public.user_favourite_dashboard_item FOR EACH ROW EXECUTE FUNCTION public.notification();


--
-- Name: access_request access_request_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_request
    ADD CONSTRAINT access_request_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id);


--
-- Name: access_request access_request_permission_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_request
    ADD CONSTRAINT access_request_permission_group_id_fkey FOREIGN KEY (permission_group_id) REFERENCES public.permission_group(id);


--
-- Name: access_request access_request_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_request
    ADD CONSTRAINT access_request_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.user_account(id);


--
-- Name: access_request access_request_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_request
    ADD CONSTRAINT access_request_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id);


--
-- Name: access_request access_request_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.access_request
    ADD CONSTRAINT access_request_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: ancestor_descendant_relation ancestor_descendant_relation_ancestor_id_entity_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ancestor_descendant_relation
    ADD CONSTRAINT ancestor_descendant_relation_ancestor_id_entity_id_fk FOREIGN KEY (ancestor_id) REFERENCES public.entity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ancestor_descendant_relation ancestor_descendant_relation_descendant_id_entity_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ancestor_descendant_relation
    ADD CONSTRAINT ancestor_descendant_relation_descendant_id_entity_id_fk FOREIGN KEY (descendant_id) REFERENCES public.entity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ancestor_descendant_relation ancestor_descendant_relation_entity_hierarchy_id_entity_hierarc; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ancestor_descendant_relation
    ADD CONSTRAINT ancestor_descendant_relation_entity_hierarchy_id_entity_hierarc FOREIGN KEY (entity_hierarchy_id) REFERENCES public.entity_hierarchy(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: answer answer_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id);


--
-- Name: answer answer_survey_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.answer
    ADD CONSTRAINT answer_survey_response_id_fkey FOREIGN KEY (survey_response_id) REFERENCES public.survey_response(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: api_client api_client_user_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_client
    ADD CONSTRAINT api_client_user_account_id_fkey FOREIGN KEY (user_account_id) REFERENCES public.user_account(id);


--
-- Name: api_request_log api_request_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.api_request_log
    ADD CONSTRAINT api_request_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: clinic clinic_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT clinic_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.country(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clinic clinic_geographical_area_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clinic
    ADD CONSTRAINT clinic_geographical_area_id_fkey FOREIGN KEY (geographical_area_id) REFERENCES public.geographical_area(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: comment comment_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id);


--
-- Name: dashboard_mailing_list dashboard_mailing_list_dashboard_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list
    ADD CONSTRAINT dashboard_mailing_list_dashboard_id_fk FOREIGN KEY (dashboard_id) REFERENCES public.dashboard(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_mailing_list dashboard_mailing_list_entity_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list
    ADD CONSTRAINT dashboard_mailing_list_entity_id_fk FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_mailing_list_entry dashboard_mailing_list_entry_dashboard_mailing_list_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list_entry
    ADD CONSTRAINT dashboard_mailing_list_entry_dashboard_mailing_list_id_fk FOREIGN KEY (dashboard_mailing_list_id) REFERENCES public.dashboard_mailing_list(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_mailing_list dashboard_mailing_list_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_mailing_list
    ADD CONSTRAINT dashboard_mailing_list_project_id_fk FOREIGN KEY (project_id) REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_relation dashboard_relation_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_relation
    ADD CONSTRAINT dashboard_relation_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.dashboard_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: dashboard_relation dashboard_relation_dashboard_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard_relation
    ADD CONSTRAINT dashboard_relation_dashboard_id_fkey FOREIGN KEY (dashboard_id) REFERENCES public.dashboard(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: dashboard dashboard_root_entity_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dashboard
    ADD CONSTRAINT dashboard_root_entity_code_fkey FOREIGN KEY (root_entity_code) REFERENCES public.entity(code) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: data_element_data_group data_element_data_group_data_element_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_element_data_group
    ADD CONSTRAINT data_element_data_group_data_element_id_fk FOREIGN KEY (data_element_id) REFERENCES public.data_element(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: data_element_data_group data_element_data_group_data_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.data_element_data_group
    ADD CONSTRAINT data_element_data_group_data_group_id_fkey FOREIGN KEY (data_group_id) REFERENCES public.data_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: entity entity_parent_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity
    ADD CONSTRAINT entity_parent_fk FOREIGN KEY (parent_id) REFERENCES public.entity(id);


--
-- Name: entity_relation entity_relation_child_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_relation
    ADD CONSTRAINT entity_relation_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.entity(id);


--
-- Name: entity_relation entity_relation_entity_hierarchy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_relation
    ADD CONSTRAINT entity_relation_entity_hierarchy_id_fkey FOREIGN KEY (entity_hierarchy_id) REFERENCES public.entity_hierarchy(id);


--
-- Name: entity_relation entity_relation_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.entity_relation
    ADD CONSTRAINT entity_relation_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.entity(id);


--
-- Name: error_log error_log_api_request_log_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_log
    ADD CONSTRAINT error_log_api_request_log_id_fkey FOREIGN KEY (api_request_log_id) REFERENCES public.api_request_log(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feed_item feed_item_country_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_item
    ADD CONSTRAINT feed_item_country_fk FOREIGN KEY (country_id) REFERENCES public.country(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feed_item feed_item_geographical_area_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_item
    ADD CONSTRAINT feed_item_geographical_area_fk FOREIGN KEY (geographical_area_id) REFERENCES public.geographical_area(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feed_item feed_item_permission_group_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_item
    ADD CONSTRAINT feed_item_permission_group_fk FOREIGN KEY (permission_group_id) REFERENCES public.permission_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: feed_item feed_item_user_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feed_item
    ADD CONSTRAINT feed_item_user_fk FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: geographical_area geographical_area_country_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geographical_area
    ADD CONSTRAINT geographical_area_country_id_fkey FOREIGN KEY (country_id) REFERENCES public.country(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: geographical_area geographical_area_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.geographical_area
    ADD CONSTRAINT geographical_area_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.geographical_area(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: meditrak_device install_id_user_account_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meditrak_device
    ADD CONSTRAINT install_id_user_account_id_fk FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: map_overlay_group_relation map_overlay_group_relation_map_overlay_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.map_overlay_group_relation
    ADD CONSTRAINT map_overlay_group_relation_map_overlay_group_id_fkey FOREIGN KEY (map_overlay_group_id) REFERENCES public.map_overlay_group(id);


--
-- Name: one_time_login one_time_logins_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.one_time_login
    ADD CONSTRAINT one_time_logins_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: option option_option_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.option
    ADD CONSTRAINT option_option_set_id_fk FOREIGN KEY (option_set_id) REFERENCES public.option_set(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: permission_group permission_group_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permission_group
    ADD CONSTRAINT permission_group_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.permission_group(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: project project_entity_hierarchy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_entity_hierarchy_id_fkey FOREIGN KEY (entity_hierarchy_id) REFERENCES public.entity_hierarchy(id);


--
-- Name: question question_data_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_data_source_id_fkey FOREIGN KEY (data_element_id) REFERENCES public.data_element(id);


--
-- Name: question question_option_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.question
    ADD CONSTRAINT question_option_set_id_fk FOREIGN KEY (option_set_id) REFERENCES public.option_set(id) ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: refresh_token refresh_token_meditrak_device_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_meditrak_device_id_fk FOREIGN KEY (meditrak_device_id) REFERENCES public.meditrak_device(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refresh_token refresh_token_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: report report_permission_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.report
    ADD CONSTRAINT report_permission_group_id_fkey FOREIGN KEY (permission_group_id) REFERENCES public.permission_group(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: survey survey_data_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_data_group_id_fkey FOREIGN KEY (data_group_id) REFERENCES public.data_group(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: survey survey_permission_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_permission_group_id_fkey FOREIGN KEY (permission_group_id) REFERENCES public.permission_group(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: survey survey_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id);


--
-- Name: survey_response_comment survey_response_comment_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_response_comment
    ADD CONSTRAINT survey_response_comment_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comment(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: survey_response_comment survey_response_comment_survey_response_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_response_comment
    ADD CONSTRAINT survey_response_comment_survey_response_id_fkey FOREIGN KEY (survey_response_id) REFERENCES public.survey_response(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: survey_response survey_response_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_response
    ADD CONSTRAINT survey_response_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON UPDATE CASCADE;


--
-- Name: survey_response survey_response_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_response
    ADD CONSTRAINT survey_response_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.survey(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: survey_response survey_response_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_response
    ADD CONSTRAINT survey_response_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: survey_screen_component survey_screen_component_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_screen_component
    ADD CONSTRAINT survey_screen_component_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: survey_screen_component survey_screen_component_screen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_screen_component
    ADD CONSTRAINT survey_screen_component_screen_id_fkey FOREIGN KEY (screen_id) REFERENCES public.survey_screen(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: survey_screen survey_screen_survey_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey_screen
    ADD CONSTRAINT survey_screen_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.survey(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: survey survey_survey_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.survey
    ADD CONSTRAINT survey_survey_group_id_fkey FOREIGN KEY (survey_group_id) REFERENCES public.survey_group(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_entity_permission user_entity_permission_entity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_entity_permission
    ADD CONSTRAINT user_entity_permission_entity_id_fkey FOREIGN KEY (entity_id) REFERENCES public.entity(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_entity_permission user_entity_permission_permission_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_entity_permission
    ADD CONSTRAINT user_entity_permission_permission_group_id_fkey FOREIGN KEY (permission_group_id) REFERENCES public.permission_group(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_entity_permission user_entity_permission_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_entity_permission
    ADD CONSTRAINT user_entity_permission_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_favourite_dashboard_item user_favourite_dashboard_item_dashboard_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favourite_dashboard_item
    ADD CONSTRAINT user_favourite_dashboard_item_dashboard_item_id_fkey FOREIGN KEY (dashboard_item_id) REFERENCES public.dashboard_item(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_favourite_dashboard_item user_favourite_dashboard_item_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favourite_dashboard_item
    ADD CONSTRAINT user_favourite_dashboard_item_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM rdsadmin;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO tupaia;
GRANT USAGE ON SCHEMA public TO tupaia_read;
GRANT ALL ON SCHEMA public TO mvrefresh;
GRANT USAGE ON SCHEMA public TO analytics_readonly;


--
-- Name: TABLE access_request; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.access_request TO tupaia_read;


--
-- Name: TABLE admin_panel_session; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.admin_panel_session TO tupaia_read;


--
-- Name: TABLE ancestor_descendant_relation; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.ancestor_descendant_relation TO tupaia_read;


--
-- Name: TABLE answer; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.answer TO tupaia_read;


--
-- Name: TABLE api_client; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.api_client TO tupaia_read;


--
-- Name: TABLE api_request_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.api_request_log TO tupaia_read;


--
-- Name: TABLE clinic; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.clinic TO tupaia_read;


--
-- Name: TABLE comment; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.comment TO tupaia_read;


--
-- Name: TABLE country; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.country TO tupaia_read;


--
-- Name: TABLE dashboard; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dashboard TO tupaia_read;


--
-- Name: TABLE dashboard_item; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dashboard_item TO tupaia_read;


--
-- Name: TABLE dashboard_mailing_list; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dashboard_mailing_list TO tupaia_read;


--
-- Name: TABLE dashboard_mailing_list_entry; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dashboard_mailing_list_entry TO tupaia_read;


--
-- Name: TABLE dashboard_relation; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dashboard_relation TO tupaia_read;


--
-- Name: TABLE data_element; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.data_element TO tupaia_read;


--
-- Name: TABLE data_element_data_group; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.data_element_data_group TO tupaia_read;


--
-- Name: TABLE data_element_data_service; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.data_element_data_service TO tupaia_read;


--
-- Name: TABLE data_group; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.data_group TO tupaia_read;


--
-- Name: TABLE data_service_entity; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.data_service_entity TO tupaia_read;


--
-- Name: TABLE data_service_sync_group; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.data_service_sync_group TO tupaia_read;


--
-- Name: TABLE data_table; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.data_table TO tupaia_read;


--
-- Name: TABLE datatrak_session; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.datatrak_session TO tupaia_read;


--
-- Name: TABLE dhis_instance; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dhis_instance TO tupaia_read;


--
-- Name: TABLE dhis_sync_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dhis_sync_log TO tupaia_read;


--
-- Name: TABLE dhis_sync_queue; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.dhis_sync_queue TO tupaia_read;


--
-- Name: TABLE entity; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.entity TO tupaia_read;


--
-- Name: TABLE entity_hierarchy; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.entity_hierarchy TO tupaia_read;


--
-- Name: TABLE entity_relation; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.entity_relation TO tupaia_read;


--
-- Name: TABLE error_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.error_log TO tupaia_read;


--
-- Name: TABLE external_database_connection; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.external_database_connection TO tupaia_read;


--
-- Name: TABLE feed_item; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.feed_item TO tupaia_read;


--
-- Name: TABLE geographical_area; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.geographical_area TO tupaia_read;


--
-- Name: TABLE indicator; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.indicator TO tupaia_read;


--
-- Name: TABLE landing_page; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.landing_page TO tupaia_read;


--
-- Name: TABLE legacy_report; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.legacy_report TO tupaia_read;


--
-- Name: TABLE lesmis_session; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.lesmis_session TO tupaia_read;


--
-- Name: TABLE map_overlay; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.map_overlay TO tupaia_read;


--
-- Name: TABLE map_overlay_group; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.map_overlay_group TO tupaia_read;


--
-- Name: TABLE map_overlay_group_relation; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.map_overlay_group_relation TO tupaia_read;


--
-- Name: TABLE meditrak_device; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.meditrak_device TO tupaia_read;


--
-- Name: TABLE meditrak_sync_queue; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.meditrak_sync_queue TO tupaia_read;


--
-- Name: TABLE migrations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.migrations TO tupaia_read;


--
-- Name: TABLE ms1_sync_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.ms1_sync_log TO tupaia_read;


--
-- Name: TABLE ms1_sync_queue; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.ms1_sync_queue TO tupaia_read;


--
-- Name: TABLE one_time_login; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.one_time_login TO tupaia_read;


--
-- Name: TABLE option; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.option TO tupaia_read;


--
-- Name: TABLE option_set; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.option_set TO tupaia_read;


--
-- Name: TABLE permission_group; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.permission_group TO tupaia_read;


--
-- Name: TABLE project; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.project TO tupaia_read;


--
-- Name: TABLE psss_session; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.psss_session TO tupaia_read;


--
-- Name: TABLE question; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.question TO tupaia_read;


--
-- Name: TABLE refresh_token; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.refresh_token TO tupaia_read;


--
-- Name: TABLE report; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.report TO tupaia_read;


--
-- Name: TABLE setting; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.setting TO tupaia_read;


--
-- Name: TABLE superset_instance; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.superset_instance TO tupaia_read;


--
-- Name: TABLE survey; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.survey TO tupaia_read;


--
-- Name: TABLE survey_group; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.survey_group TO tupaia_read;


--
-- Name: TABLE survey_response; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.survey_response TO tupaia_read;


--
-- Name: TABLE survey_response_comment; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.survey_response_comment TO tupaia_read;


--
-- Name: TABLE survey_screen; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.survey_screen TO tupaia_read;


--
-- Name: TABLE survey_screen_component; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.survey_screen_component TO tupaia_read;


--
-- Name: TABLE sync_group_log; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.sync_group_log TO tupaia_read;


--
-- Name: TABLE tupaia_web_session; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.tupaia_web_session TO tupaia_read;


--
-- Name: TABLE "userSession"; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public."userSession" TO tupaia_read;


--
-- Name: TABLE user_account; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.user_account TO tupaia_read;


--
-- Name: TABLE user_entity_permission; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.user_entity_permission TO tupaia_read;


--
-- Name: TABLE user_favourite_dashboard_item; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.user_favourite_dashboard_item TO tupaia_read;


--
-- Name: TABLE permissions_based_meditrak_sync_queue; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.permissions_based_meditrak_sync_queue TO tupaia_read;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE tupaia IN SCHEMA public GRANT SELECT ON TABLES  TO tupaia_read;


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 13.13
-- Dumped by pg_dump version 14.11 (Ubuntu 14.11-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.migrations DROP CONSTRAINT migrations_pkey;
ALTER TABLE public.migrations ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.migrations_id_seq;
DROP TABLE public.migrations;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    run_on timestamp without time zone NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, name, run_on) FROM stdin;
1	/20180411032938-createAnswerTable	2018-06-01 01:40:39.749
2	/20180411032947-createApiRequestLogTable	2018-06-01 01:40:39.762
3	/20180411033003-createClinicTable	2018-06-01 01:40:39.775
4	/20180411033011-createCountryTable	2018-06-01 01:40:39.787
5	/20180411034141-createDhisSyncQueueTable	2018-06-01 01:40:39.798
6	/20180411034202-createDhisSyncLogTable	2018-06-01 01:40:39.819
7	/20180411034213-createErrorLogTable	2018-06-01 01:40:39.829
8	/20180411034222-createGeographicalAreaTable	2018-06-01 01:40:39.842
9	/20180411034237-createMeditrakSyncQueueTable	2018-06-01 01:40:39.862
10	/20180411034254-createPermissionGroupTable	2018-06-01 01:40:39.877
11	/20180411034302-createQuestionTable	2018-06-01 01:40:39.895
12	/20180411034309-createRefreshTokenTable	2018-06-01 01:40:39.904
13	/20180411034315-createSettingTable	2018-06-01 01:40:39.912
14	/20180411034322-createSurveyTable	2018-06-01 01:40:39.922
15	/20180411034328-createSurveyGroupTable	2018-06-01 01:40:39.934
16	/20180411034336-createSurveyResponseTable	2018-06-01 01:40:39.944
17	/20180411034344-createSurveyScreenTable	2018-06-01 01:40:39.955
18	/20180411034351-createSurveyScreenComponentTable	2018-06-01 01:40:39.968
19	/20180411034420-createUserAccountTable	2018-06-01 01:40:39.986
20	/20180411034429-createUserCountryPermissionTable	2018-06-01 01:40:39.997
21	/20180411045051-addTableRelationships	2018-06-01 01:40:40.009
22	/20180411091413-CreateUserRewardTable	2018-06-01 01:40:40.044
23	/20180426071045-addOrganisationUnitCodesToGeographicalAreas	2018-06-01 01:40:40.053
24	/20180426073304-createUserGeographicalAreaPermissionTable	2018-06-01 01:40:40.072
25	/20180503062832-FeedItem	2018-06-01 01:40:40.096
26	/20180503065148-AddTimestampToFeedItem	2018-06-01 01:40:40.113
27	/20180504110400-ChangeFeedItemCacheToTemplateVariables	2018-06-01 01:40:40.122
28	/20180509045837-AddLinkToFeedItems	2018-06-01 01:40:40.136
29	/20180510015244-AddAnnouncementFeedItem	2018-06-01 01:40:40.15
30	/20180510021012-RemoveLinkColumnFromFeed	2018-06-01 01:40:40.16
31	/20180511003957-AddModelRelationshipsToUserRewards	2018-06-01 01:40:40.17
32	/20180511004328-AddCreatedToRewards	2018-06-01 01:40:40.185
33	/20180511011825-RemoveUniqueConstraintFromUserReward	2018-06-01 01:40:40.193
34	/20180511014239-PopulateUserRewards	2018-06-01 01:40:40.338
35	/20180515004232-ChangeFeedCreatedToCreationDate	2018-06-01 01:40:40.345
36	/20180516035341-ChangeModelNameToFeedItemType	2018-06-01 01:40:40.363
37	/20180516035629-ChangeRewardModelNameToType	2018-06-01 01:40:40.372
38	/20180517050445-RenameModelIdToRecordId	2018-06-01 01:40:40.378
39	/20180531102754-CreateInstallIdTable	2018-06-01 01:40:40.394
40	/20180531235913-AddPlatformToInstallId	2018-06-01 01:40:40.408
41	/20180603211142-RemoveRepeatingSurveyCoconuts	2018-06-03 21:53:32.29
42	/20180604032437-fix-json-in-feed-items	2018-06-04 04:14:25.474
43	/20180604034558-fix-ids-for-announcement-items	2018-06-04 04:14:25.663
44	/20180611202247-DeleteOrphanGeographicalAreas	2018-06-12 03:49:06.106
45	/20180605215529-AddVisibilityCriteriaToSurveyScreenComponent	2018-07-27 02:47:47.783
46	/20180605222815-ChangeDefaultForAnswersEnablingFollowUp	2018-07-27 02:47:47.797
47	/20180605234358-ChangeDefaultForSurveyCountries	2018-07-27 02:47:47.806
48	/20180606025742-AddValidationCriteriaToSurveyScreenComponent	2018-07-27 02:47:47.813
49	/20180606040539-AnswersEnablingFollowUpToVisibilityCriteria	2018-07-27 02:47:48.124
50	/20180611202249-CreateUserClinicPermission	2018-07-27 02:47:48.347
52	/20180611202251-ImportOrganisationUnitCodesFromDhis	2018-07-27 02:47:54.861
53	/20180709061124-AddFacilityChangeRecords	2018-07-27 02:47:55.061
54	/20180710000210-AddAreaChangeRecords	2018-07-27 02:47:55.076
55	/20180717003225-RemoveRedundantUserCountryPermissionChangeRecord	2018-07-27 02:47:55.347
56	/20180611202250-AddCountryCodesToFacilityCodes	2018-07-27 03:11:05.755
57	/20180723054145-RedateSocialHealthFeedAnnouncement	2018-07-30 01:58:40.47
58	/20180716044506-CreateOneTimeLoginTable	2018-08-13 04:59:22.157
59	/20180822001459-AddSubmissionTime	2018-08-22 03:59:02.459
60	/20180827095252-AddServerNameColumns	2018-08-29 09:51:33.497
61	/20180831010353-ConvertAggregationServerNameToIsDataRegional	2018-09-03 09:28:51.965
62	/20180903221412-AddPriorityToDhisSyncQueue	2018-09-03 22:24:05.145
63	/20180919063336-AddTimezoneToSurveyResponse	2018-09-19 07:08:40.266
64	/20181113232232-createOptionSetTables	2018-12-05 05:23:07.755
65	/20181204021653-makeOptionSetNameUnique	2018-12-05 05:23:07.78
66	/20181210033201-DeleteUserCountryPermissionSyncRecords	2019-01-14 05:13:01.281
67	/20181211010309-AddMissingSubmissionTimes	2019-01-14 05:13:01.398
68	/20190205071030-AlterTriggerToHappenOnInsert	2019-02-05 07:26:28.092
69	/20190207032726-ChangeOldBCD1Responses	2019-02-07 04:18:17.456
70	/20180806045523-CreateUserSessionTable	2019-02-20 02:02:39.23
71	/20180806045535-CreateMapOverlayTable	2019-02-20 02:02:39.245
72	/20180806045544-CreateDashboardReportTable	2019-02-20 02:02:39.253
73	/20180806045553-CreateDashboardTabTable	2019-02-20 02:02:39.262
74	/20180806045709-PopulateDashboardReports	2019-02-20 02:02:39.284
75	/20180806045715-PopulateDashboardTabs	2019-02-20 02:02:39.296
76	/20180806045722-PopulateMapOverlays	2019-02-20 02:02:39.367
77	/20180828015804-AddCountrySpecificFlagToReportsAndOverlays	2019-02-20 02:02:39.389
78	/20180830061452-AddAccessPolicyToUserSession	2019-02-20 02:02:39.411
79	/20180830092310-AddCodeToDashboardTab	2019-02-20 02:02:39.418
80	/20180830092315-BuildReproductiveHealthDashboards	2019-02-20 02:02:39.424
81	/20180903025444-BuildFamilyPlanningValidationDashboard	2019-02-20 02:02:39.428
82	/20180903213305-SwitchColumnsAndRowsFamilyPlanning	2019-02-20 02:02:39.432
83	/20180905083227-BuildFamilyPlanningValidationReports	2019-02-20 02:02:39.438
84	/20180905090955-MoveDataElementColumnTitleForFP	2019-02-20 02:02:39.442
85	/20180905095249-BuildMCH05And03ValidationReports	2019-02-20 02:02:39.447
86	/20180905102415-SwitchColumnsAndRowsHomeVisits	2019-02-20 02:02:39.451
87	/20180910004520-StripFromRowNamesFamilyPlanning	2019-02-20 02:02:39.455
88	/20180910013150-AddTotalsToFamilyPlanning	2019-02-20 02:02:39.459
89	/20180910015304-OrderRowsFamilyPlanning	2019-02-20 02:02:39.465
90	/20180910044327-AllowMultipleCategoriesInTable	2019-02-20 02:02:39.469
91	/20180910051853-StripServiceRowNamesUsingRegex	2019-02-20 02:02:39.473
92	/20180910053016-AddClinicToVisitsValidation	2019-02-20 02:02:39.476
93	/20180910055439-HomeClinicVisitsShouldShowTotals	2019-02-20 02:02:39.479
94	/20180910063802-BuildDeliveriesValidationReport	2019-02-20 02:02:39.484
95	/20180912065036-AddTotalLineToMCH07	2019-02-20 02:02:39.487
96	/20180912065445-ReorderImms	2019-02-20 02:02:39.491
97	/20180912065745-DeleteMCH4FromMCH01	2019-02-20 02:02:39.496
98	/20180912224455-CustomiseDateColumnNameDeliveries	2019-02-20 02:02:39.499
99	/20180913063315-MovePeriodGranularityToViewJson	2019-02-20 02:02:39.503
100	/20180913225207-SwitchColumnsAndRowsMCH05	2019-02-20 02:02:39.551
101	/20180913230745-AddTotalsColumnToMCH05	2019-02-20 02:02:39.555
102	/20180913235047-SplitTotalsMCH05	2019-02-20 02:02:39.558
103	/20180914001813-RemoveColumnTitles	2019-02-20 02:02:39.561
104	/20180914005215-AddTotalsColumnToMCH0304	2019-02-20 02:02:39.565
105	/20180914005332-ReRenameMCH0304	2019-02-20 02:02:39.568
106	/20180917001145-BuildTotalHighRiskPregnanciesValidationReport	2019-02-20 02:02:39.572
107	/20180917001148-BuildECPValidationReport	2019-02-20 02:02:39.576
108	/20180917002810-ReorderValidationReports	2019-02-20 02:02:39.579
109	/20180917002812-RenameMCH01	2019-02-20 02:02:39.583
110	/20180917065000-RenameRHValidationDashboardGroup	2019-02-20 02:02:39.587
111	/20180917065554-BuildHighPriorityFP	2019-02-20 02:02:39.592
112	/20180918045054-MoveUseValueIfNameMatches	2019-02-20 02:02:39.595
113	/20180918045408-ChangeQueryJsonToDataBuilderConfig	2019-02-20 02:02:39.599
114	/20180918045705-RemoveApiRouteFromDataBuilderConfig	2019-02-20 02:02:39.602
115	/20180920060226-AddStackIdToBarCharts	2019-02-20 02:02:39.606
116	/20180920230539-MoveViewJsonStuffToDataBuilderConfig	2019-02-20 02:02:39.61
117	/20180920232717-BuildHighPriorityMCH	2019-02-20 02:02:39.616
118	/20180924050102-AddPeriodGranularityToMedsByFacility	2019-02-20 02:02:39.619
119	/20180925011124-RemoveIncorrectAggregationTypes	2019-02-20 02:02:39.623
120	/20180925060833-RemoveIndicators	2019-02-20 02:02:39.626
121	/20180925065555-AddLabelsToMultiDataElement	2019-02-20 02:02:39.631
122	/20180926051407-RenamePriorityDiseaseOverlay	2019-02-20 02:02:39.64
123	/20181001004147-ClarifyDescriptionMedsAvailability	2019-02-20 02:02:39.643
124	/20181001055147-BuildIMMS0102	2019-02-20 02:02:39.648
125	/20181001064741-BuildIMMS0103	2019-02-20 02:02:39.652
126	/20181001072924-BuildIMMSIndicators	2019-02-20 02:02:39.658
127	/20181019033903-RHTabsOnlyInTonga	2019-02-20 02:02:39.661
128	/20181102060638-TurnOffDisasterResponseInTonga	2019-02-20 02:02:39.664
129	/20181115041947-RHDashboardsOnInDemoLand	2019-02-20 02:02:39.669
130	/20181119052246-RemoveReferenceTo-TEXTDataElements	2019-02-20 02:02:39.673
131	/20181119054850-RemoveDuplicateElectricitySourceOverlay	2019-02-20 02:02:39.676
132	/20181128235419-SetBarChartRange	2019-02-20 02:02:39.68
133	/20181129003443-ANZGITAInventory	2019-02-20 02:02:39.685
134	/20181130025656-ANZGITASetRegionalFlag	2019-02-20 02:02:39.688
135	/20181130032020-ANZGITAAddSwanHill	2019-02-20 02:02:39.691
136	/20181130035414-ANZGITAUpdateVaricealBander	2019-02-20 02:02:39.698
137	/20181203232213-AddRawDataDownloadsDashboardTab	2019-02-20 02:02:39.702
138	/20181204021405-ANZGITA-excel	2019-02-20 02:02:39.706
139	/20181205051312-ReverseDisasterResponseCheckboxes	2019-02-20 02:02:39.709
140	/20181211040528-AddGreenRedColorsToDisasterResponse	2019-02-20 02:02:39.712
141	/20181211221442-StartCountryLevelDisasterResponseDashboard	2019-02-20 02:02:39.717
142	/20181217053723-ChangeWaterPurifyingTabletsType	2019-02-20 02:02:39.72
143	/20181217233048-FixMeasures	2019-02-20 02:02:39.725
144	/20181219000000-UpdateMeasureDisplayTypes	2019-02-20 02:02:39.729
145	/20181219040127-UpdateMapMeasureTable	2019-02-20 02:02:39.741
146	/20181221011216-UpdateCriticalMedicinesChartTitle	2019-02-20 02:02:39.745
147	/20190110231222-AddMeasureSort	2019-02-20 02:02:39.849
148	/20190111003836-UpdateWaterPurification	2019-02-20 02:02:39.855
149	/20190115011504-RenameTotalHighRiskPregnancies	2019-02-20 02:02:39.861
150	/20190115234004-SetWaterPurificationToRadius	2019-02-20 02:02:39.864
151	/20190116024849-UpdateRadiusIcons	2019-02-20 02:02:39.868
152	/20190117022340-RemoveVaccinationAtFacilityFromDashboard	2019-02-20 02:02:39.871
153	/20190123054504-addDataConfMapOverlay	2019-02-20 02:02:39.874
154	/20190206033736-IHRMapOverlays	2019-02-20 02:02:39.879
155	/20190206235343-IHRMatrixReport	2019-02-20 02:02:39.883
156	/20190208044642-ConstrainImmsReportsToSingleYear	2019-02-20 02:02:39.887
157	/20190212063050-FixServiceSuggestionDrillDown	2019-02-20 02:02:39.89
158	/20190213041645-IHRBarChart	2019-02-20 02:02:39.893
159	/20190214005038-AddExtraFormattingInfoColumn	2019-02-20 02:02:39.902
160	/20190217222420-IHREditMapOverlayNames	2019-02-20 02:02:39.905
161	/20190219000624-TurnOnDisasterResponseVanuatu	2019-02-20 02:02:39.908
162	/20190219034138-UpdateIHROverlayPermissions	2019-02-20 02:02:39.911
163	/20190217233150-MakeMapOverlaysCountrySpecific	2019-02-20 02:07:06.602
164	/20190218001403-IsolatePEHSAndIHRToCountries	2019-02-20 02:07:06.614
165	/20190222000001-AddEntityTable	2019-02-20 23:26:45.16
166	/20190222000002-AddFacilityTypeColumns	2019-02-20 23:26:45.555
167	/20190222000003-AddFacilityEntities	2019-02-20 23:26:46.578
168	/20190222000004-AddRegionEntities	2019-02-20 23:26:49.975
169	/20190220021712-AddAdditionalEntityFields	2019-02-22 04:19:07.696
170	/20190221233026-AddEntityBounds	2019-02-25 03:27:30.695
171	/20190222033833-AddVenezuela	2019-02-25 03:27:31.788
172	/20190222072224-AddPointBounds	2019-02-25 03:27:31.828
173	/20190224230636-FixVenezuelaEntityCodes	2019-02-25 03:27:31.84
174	/20190225021100-AddTypeDetailsToVenezuela	2019-02-25 03:27:31.866
175	/20190224231803-FixVenezuelaEntityCodes	2019-02-25 03:35:12.156
176	/20190226235914-FixVenezuelaHierarchy	2019-02-27 05:27:19.394
177	/20190304232043-CreateTongaCommunityHealthFacilityDashboard	2019-03-06 06:14:51.026
178	/20190305020301-CreateTongaCommunityHealthReports	2019-03-06 06:14:51.134
179	/20190305062226-CreateDemoCommunityHealthDashboard	2019-03-06 06:14:51.174
180	/20190314025109-AddQuestionLabelToComponents	2019-03-15 04:40:01.586
181	/20190315033609-AddVenezuelaRawDataDownloads	2019-03-15 05:38:41.644
182	/20190106231028-BuildBasicDisasterResponseMetrics	2019-03-21 04:21:59.47
183	/20190109000522-CreateDisasterEnums	2019-03-21 04:21:59.62
184	/20190109005419-CreateDisasterTable	2019-03-21 04:21:59.661
185	/20190109005425-CreateDisasterEventTable	2019-03-21 04:21:59.706
186	/20190125023420-CreateDashboardModeEnum	2019-03-21 04:21:59.718
187	/20190125023839-AddDashboardGroupModeColumn	2019-03-21 04:21:59.746
188	/20190129013217-CreateDisasterDashboardReport	2019-03-21 04:21:59.865
189	/20190208060028-AddDisasterOverlays	2019-03-21 04:21:59.902
190	/20190226025209-AddDisasterStatusToOverlay	2019-03-21 04:21:59.968
191	/20190226043641-AddFacilityTypeDisasterOverlay	2019-03-21 04:22:00.035
192	/20190226062002-AddDefaultIndicatorToMeasures	2019-03-21 04:22:00.056
193	/20190227042102-CreateDisasterAffectedFacilitiesDashboard	2019-03-21 04:22:00.071
194	/20190301032043-UpdateFacilitiesAffectedByDisasterMeasure	2019-03-21 04:22:00.083
195	/20190302025555-SetDisasterResponseDashboardViewmode	2019-03-21 04:22:00.098
196	/20190302025855-AddDisasterResponseDashboardsToDemoLand	2019-03-21 04:22:00.116
197	/20190303233005-RenameFacilitiesAffectedReport	2019-03-21 04:22:00.127
198	/20190304000300-AddNormalInpatientBedsOverlay	2019-03-21 04:22:00.163
199	/20190307014158-AddFacilityStatusPostDisasterReport	2019-03-21 04:22:00.187
200	/20190308065702-UpdateDisasterAffectedFacilitiesByTypeReport	2019-03-21 04:22:00.196
201	/20190312035718-UpdateDisasterResponseBasicFacilityMetrics	2019-03-21 04:22:00.219
202	/20190312051810-BuildDisasterResponseInfrastructureImpactReport	2019-03-21 04:22:00.248
203	/20190314054424-DisasterOverlayTweaks	2019-03-21 04:22:00.293
204	/20190314231152-RefactorBasicDisasterDataComparisonReport	2019-03-21 04:22:00.302
205	/20190315024428-AddBoundsandPointsForBrokenDemoLandFacilities	2019-03-21 04:22:00.333
206	/20190315034646-BuildSingleValueDisasterFacilityMetrics	2019-03-21 04:22:00.344
207	/20190318223802-AddTitleToInfrastructureImpact	2019-03-21 04:22:00.356
208	/20190318230928-UseNewInpatientBedsInDisasterResponseComparisons	2019-03-21 04:22:00.363
209	/20190320053827-UpdateDisasterResponseComparisonCodes	2019-03-21 04:22:00.371
210	/20190320223745-ConvertAffectedStatusToPrimaryMeasure	2019-03-21 04:22:00.409
211	/20190321005029-UseNewDataBuilderForImpactedInfrastructure	2019-03-21 04:22:00.418
212	/20190321031718-FixIconLegendForDisasterAffectedFacilities	2019-03-21 04:22:00.455
213	/20190321035735-FlipElectricityAndWaterDamage	2019-03-21 04:22:00.463
214	/20190328033334-RemoveNoFridgePresentMeasure	2019-03-28 06:22:26.313
215	/20190403233329-AddCHClinicDressings	2019-04-04 00:45:19.727
216	/20190404003347-AddCHClinicDressingToDistrictAndFacility	2019-04-04 00:45:19.763
217	/20190403085602-UpdateDisasterResponseSurveysAndReports	2019-04-11 00:19:55.09
218	/20190405001207-UpdateLatestDataValueDateReports	2019-04-11 00:19:55.107
219	/20190405003121-DeleteVUDisasterDashboardGroups	2019-04-11 00:19:55.12
220	/20190405015626-UpdateDisasterPieChartColor	2019-04-11 00:19:55.13
221	/20190408232032-UpdateRawDataDownloadDisasterSurveys	2019-04-11 00:19:55.153
222	/20190410062856-AddTongaCommunityHealthComplicationScreeningCharts	2019-04-11 00:19:55.212
223	/20190226005237-createMs1MigrationQueue	2019-04-14 23:40:56.069
224	/20190402044417-ms1Log	2019-04-14 23:40:56.087
225	/20190404070131-UpdateSurveyCodes	2019-04-14 23:40:56.099
226	/20190405055945-addMS1Metadata	2019-04-14 23:40:56.289
227	/20190408020403-AddFieldsToDHISSyncQueue	2019-04-14 23:40:56.567
228	/20190409033240-addMs1EndpointsToSurveys	2019-04-14 23:40:56.699
229	/20190410234158-AllowLegacyDisasterDataToExport	2019-04-14 23:40:56.786
230	/20190411003153-add-temanoku-metadata	2019-04-14 23:40:56.832
231	/20190411061555-resolvingMissingMS1FacilitiesPass1	2019-04-14 23:40:56.89
232	/20190411011052-FixNonPercentageChartsValueTypes	2019-04-16 01:10:25.142
233	/20190416000644-FixChartLegendsValueTypes	2019-04-16 01:10:25.16
234	/20190416054350-AddmSupplyRolloutMapOverlays	2019-04-26 06:13:21.492
235	/20190418043045-AddIvoryCoastmSupplyReports	2019-04-26 06:13:21.516
236	/20190423235726-AddCIV	2019-04-26 06:13:21.921
237	/20190426002606-AddIvoryCoastPointBounds	2019-04-26 06:13:21.942
238	/20190426014035-SeparateYamoussoukro	2019-04-26 06:13:21.961
239	/20190426052826-RemoveBelierEntityFromIvoryCoast	2019-04-26 06:13:21.97
240	/20190508054522-AddAbidjanRegionToCI	2019-05-17 05:47:06.76
241	/20190508234849-AddFacilityTypesForCI	2019-05-17 05:47:06.784
242	/20190509061337-FixAddFacilityTypesForCIMigration	2019-05-17 05:47:06.816
243	/20190510002605-CalculateBoundsForAbidjanRegion	2019-05-17 05:47:06.855
244	/20190510040941-UseDataElementCodeForPEHSDrilldown	2019-05-17 05:47:06.895
245	/20190510045056-RenameMonthlyDataValuesDataBuilder	2019-05-17 05:47:06.917
246	/20190510064134-DefineDataSourcesExplicitly	2019-05-17 05:47:07.022
247	/20190510064317-ConvertPercentageInGroupToNoSqlView	2019-05-17 05:47:07.082
248	/20190521050519-FixPEHSRawDownloads	2019-05-21 06:24:11.882
249	/20190521000001-AllowDonorLevelAccessMSUPOverlays	2019-05-22 04:22:54.577
250	/20190521000002-MoveBarChartBarsConfigOutOfPresentationOptions	2019-05-22 04:22:54.601
251	/20190521000003-AddTongaCommunityHealthMedicationReport	2019-05-22 04:22:54.617
252	/20190521000004-AddPeriodGranularityAndSumTotalForCHDressingsReport	2019-05-22 04:22:54.627
253	/20190521000005-AddTongaCHWeeklyHomeVistsReport	2019-05-22 04:22:54.65
254	/20190521000006-AddTongaCHRiskFactorsInDMHTNReport	2019-05-22 04:22:54.667
255	/20190521000007-UseRegionalDataForTongaRiskFactorsReport	2019-05-22 04:22:54.688
256	/20190521000008-AddTongaCHRiskFactorsReportToFacilityLevel	2019-05-22 04:22:54.704
257	/20190521000009-RenameIsDenominatorAnnualToFillEmptyValues	2019-05-22 04:22:54.722
258	/20190521000010-UpdateDmHtnMedicationReports	2019-05-22 04:22:54.735
259	/20190521000011-UseSumAllDataBuilderForClinicDressings	2019-05-22 04:22:54.763
260	/20190521000012-AddCHWeeklyHomeVisitsToFacilityAndCountry	2019-05-22 04:22:54.775
261	/20190521000013-RenameBarConfigToChartConfig	2019-05-22 04:22:54.797
262	/20190521000014-RemoveRiskFactorsReportTongaCH	2019-05-22 04:22:54.812
263	/20190522000836-AddValuesOfInterestToConfig	2019-05-22 04:22:54.821
264	/20190521050929-AddTongaRHFamilyPlanningAnnualContraceptives	2019-05-22 23:45:13.22
265	/20190522002836-AddTongaRhFamilyPlanningTfhaReport	2019-05-22 23:45:13.237
266	/20190522011700-AddTongaRhAdministrativeSchoolDataReport	2019-05-22 23:45:13.247
267	/20190522013335-AddTongaRhChildhoodImmunizationCoverageReport	2019-05-22 23:45:13.271
268	/20190522024121-AddTongaRhMaternalImmunizationCoverageReport	2019-05-22 23:45:13.287
269	/20190522030931-AddTongaRhSchoolImmunizationCoverageReport	2019-05-22 23:45:13.298
270	/20190522044630-AddTongaRhAnnualTotalPregnaciesByAgeReport	2019-05-22 23:45:13.305
271	/20190522052450-AddTongaRhAnnualPostnatalClinicCoverageReport	2019-05-22 23:45:13.315
272	/20190522061547-AddTongaRhAnnualPopulationBreakdownReport	2019-05-22 23:45:13.323
273	/20190522071354-AddTongaRhAnnualPopulationBreakdownHouseholdsReport	2019-05-22 23:45:13.332
274	/20190522072314-AddTongaRhAnnualMaternalDeaths	2019-05-22 23:45:13.342
275	/20190522073623-AddTongaRhAnnualGeneralMortality	2019-05-22 23:45:13.35
276	/20190522064645-AddMoreCIFacilityCoordinates	2019-05-23 01:31:14.734
277	/20190522235057-AddMissingCIFacilityEntitiesV2	2019-05-23 01:31:14.85
278	/20190523021512-UpdateYamoussoukroStorageFacilityTypeName	2019-05-23 03:35:48.553
279	/20190410231841-AddAPIClientsTable	2019-05-28 07:59:33.799
280	/20190415011159-AddClinicCodeConstraint	2019-05-28 07:59:33.831
281	/20190415064339-AddEntityColumnToSurveyResponse	2019-05-28 07:59:33.849
282	/20190523061000-ConvertSecretKeyToSecretKeyHash	2019-05-28 07:59:33.856
283	/20190528050830-ChangeBadRequestDefault	2019-05-28 08:13:47.467
284	/20190523025115-AddTongaChDmAndHtnPrevalenceReport	2019-05-30 05:13:00.327
285	/20190524000317-RenameFillEmptyValuesToFillEmptyDenominatorValues	2019-05-30 05:13:00.352
286	/20190524010538-AddTongaChDmAndHtnIncidenceReport	2019-05-30 05:13:00.367
287	/20190524015629-AddPercentageValueTypeInReports	2019-05-30 05:13:00.378
288	/20190530004611-AddHealthPromotionUnitValidationDashboard	2019-05-30 05:13:00.412
289	/20190529010604-UpdateIHRMapOverlayMeasures	2019-05-30 06:27:20.131
290	/20190530054820-AddCIBelier50Coordinates	2019-05-30 06:27:20.386
291	/20190530024804-AddTongaHpuMonthlyNationalQuitlineReport	2019-05-31 06:22:22.804
292	/20190530035136-AddTongHpuMonthlyNationalQuitlineNewCallsReport	2019-05-31 06:22:22.822
293	/20190530041126-AddTongaHpuMonthlyNutritionCounsellingReport	2019-05-31 06:22:22.836
294	/20190530043553-AddTongaHpuMonthlyNutritionCounsellingSessionsReport	2019-05-31 06:22:22.854
295	/20190531071226-updateSurveyCodesMS1	2019-06-04 02:44:36.183
296	/20190603033404-RemoveIsDataRegionalColumn	2019-06-04 02:44:36.268
297	/20190603040126-ConvertCaseIsDataRegional	2019-06-04 02:44:36.336
298	/20190604022445-SetDefaultIntegrationMetadata	2019-06-04 02:44:36.346
299	/20190530045142-AddTongaHpuBaselineQuitlineCaseLoadReport	2019-06-04 10:10:11.952
300	/20190603044757-AddTongaChNcdCasesReport	2019-06-04 10:10:11.982
301	/20190603045839-AddTongaChNewlyDiagnosedDmAndHtnCasesReport	2019-06-04 10:10:12.001
302	/20190603054719-AddTongaHpuMonthlyTvRadioAndSocialMedia	2019-06-04 10:10:12.013
303	/20190603065450-AddTongaHpuMonthlyPhysicalActivityReport	2019-06-04 10:10:12.039
304	/20190604045359-FixNcdCasesReport	2019-06-04 10:10:12.064
305	/20190604073505-AddTongaHpuMonthlyPhysicalActivityDrillDownReport	2019-06-04 13:12:17.111
306	/20190604074848-AddTongaHpuNcdRiskFactorScreeningEventReport	2019-06-04 13:12:17.128
307	/20190604080957-AddTongaHpuMonthlyIecDistributionReport	2019-06-04 13:12:17.143
308	/20190604085921-AddTongaHpuMonthlyTrainingsAndHealthTalksReport	2019-06-04 13:12:17.167
309	/20190604093044-AddTongaHpuMonthlyIecDistributionDrillDownReport	2019-06-04 13:12:17.209
310	/20190604093502-AddTongaHpuMonthlyTrainingsAndHealthTalksDrillDownReport	2019-06-04 13:12:17.235
311	/20190604104305-AddHP06ValidationReport	2019-06-04 13:12:17.252
312	/20190604105441-AddTongaHpuNcdRiskFactorScreeningEventDrillDownReport	2019-06-04 13:12:17.261
313	/20190604123857-ConsolidateSettingTypeCategoryInMonthlyPhysicalActivityReport	2019-06-17 05:59:10.861
314	/20190605004854-AddProgramCodeToHP07	2019-06-17 05:59:10.878
315	/20190605010756-AddTotalsToSpecificCategoriesHP06	2019-06-17 05:59:10.893
316	/20190605072511-RemovePeriodGranularityDrillDown	2019-06-17 05:59:10.905
317	/20190605073057-RefactorAndRenamePercentagesByGroup	2019-06-17 05:59:10.946
318	/20190607034703-RenameDataSourceTypeValues	2019-06-17 05:59:10.972
319	/20190607071742-RenameDataSourceCodeToCodes	2019-06-17 05:59:10.997
320	/20190611030359-RenameDataSourcesToDataServices	2019-06-17 05:59:11.017
321	/20190612002911-AddTongaChDmAndHtnComplicationsScreeningCompletionReport	2019-06-17 05:59:11.036
322	/20190613040018-AddDropOutCasesInMonthlyNationQuitlineReport	2019-06-17 05:59:11.094
323	/20190613054549-AddOptionInMonthlyIecDistributionReport	2019-06-17 05:59:11.127
324	/20190524063055-GeographicalAreaOrganisationUnitCodes	2019-06-19 03:07:31.905
325	/20190617015944-RemoveNotificationsFromUserSessionTable	2019-06-19 03:07:31.981
326	/20190613063847-AddTongaCH4ValidationReport	2019-06-21 06:40:50.561
327	/20190613081700-AddTongaCH11ValidationReport	2019-06-21 06:40:50.585
328	/20190619234449-ConvertTongaClinicTypeToNursingClinic	2019-06-21 06:40:50.601
329	/20190620052141-FixCH4ValidationReport	2019-06-21 06:40:50.639
330	/20190621020100-ConvertTongaNursingClinicsBackToClinics	2019-06-21 06:40:50.736
331	/20190621051307-AddMissingVanuatuGeojson	2019-06-21 06:40:50.958
332	/20190614031144-AddQuestionHook	2019-06-21 06:42:35.765
333	/20190619061923-AddGeolocateAndPhotoHooks	2019-06-21 06:42:35.804
334	/20190619060547-CreateEntityRelationTable	2019-06-28 07:06:34.06
335	/20190625060002-AddUniqueConstraintsForUpsert	2019-06-28 07:06:55.007
336	/20190626011143-CascadeUserDeletesToApiLog	2019-06-28 07:06:57.634
337	/20190626043217-MakeQuestionCodeUnique	2019-06-28 07:07:03.666
338	/20190628025659-Ms1UpdateFacilities	2019-06-28 07:07:05.354
339	/20190522044520-AddImmsFridgeStatReports	2019-07-12 07:31:15.865
340	/20190528063807-AddImmsVaccineSoHReport	2019-07-12 07:31:15.9
341	/20190531033900-AddVerySpecificTongaVillagesServicedReport	2019-07-12 07:31:15.924
342	/20190620062126-AddCodeForImmunisationDashboardGroups	2019-07-12 07:31:15.95
343	/20190620062157-AddFridgeBreachesReport	2019-07-12 07:31:16.028
344	/20190625014307-VUVaccinesPortalSurveyVisualistations	2019-07-12 07:31:16.088
345	/20190626021701-AddTongaPopulationMapOverlays	2019-07-12 07:31:16.11
346	/20190629021415-FixUserGoupForImmunisationDashboard	2019-07-12 07:31:16.136
347	/20190629065125-InsertCorrectReportsInImmunisationFacility	2019-07-12 07:31:16.172
348	/20190629085943-AddTemperatureBreachesMapOverlay	2019-07-12 07:31:17
349	/20190630013836-AddProgramCodeToImmsSOH	2019-07-12 07:31:17.06
350	/20190630020107-AddImmsSOHAtFacilityLevel	2019-07-12 07:31:17.133
351	/20190630083038-ImmsStockoutsFacility	2019-07-12 07:31:17.221
352	/20190630083253-AddMissingVaccine	2019-07-12 07:31:17.235
353	/20190630084135-AddFridgeDailyTemperaturesReport	2019-07-12 07:31:17.268
354	/20190630135821-StripQuantityFromStartOfStockouts	2019-07-12 07:31:17.314
355	/20190630140921-MakeStockoutMultiSingleValue	2019-07-12 07:31:17.372
356	/20190630141834-MakeStockoutMultiSingleValueTakeTwo	2019-07-12 07:31:17.392
357	/20190630203941-SetValueTypeTempReport	2019-07-12 07:31:17.42
358	/20190701022046-AlterMapOverlayId	2019-07-12 07:31:17.624
359	/20190701022106-AddBreachesXStockOnHandMapOverlay	2019-07-12 07:31:17.751
360	/20190705040038-RemoveTTVaccineFromReports	2019-07-12 07:31:17.769
361	/20190709003722-RenameAndRefactorOrganisationUnitMatrix	2019-07-12 07:31:17.888
362	/20190709003729-ShowFacilitiesInVaccineCountReport	2019-07-12 07:31:17.941
363	/20190709062420-UpdateTongaHouseholdsOverlayId	2019-07-12 07:31:17.961
364	/20190709063035-AddReferenceLinesToFridgeTemperatureChart	2019-07-12 07:31:17.975
365	/20190711001559-RenameBreachesXStockOnHand	2019-07-12 07:31:18.035
366	/20190711233304-ChangeVaccineCountMatrixToDoses	2019-07-12 07:31:18.068
367	/20190708001046-RemoveGeoFromNotify	2019-07-15 05:06:10.733
368	/20190708001047-AddNotificationForEntityType	2019-07-29 23:59:00.301
369	/20190719043256-SetMetadataToJSONB	2019-07-29 23:59:00.752
370	/20190719043257-UpdateCodeToId	2019-07-29 23:59:06.302
371	/20190723000023-DeleteCodeBasedEntityChanges	2019-07-29 23:59:10.953
372	/20190725013154-AddWISHEnities	2019-07-29 23:59:11.312
373	/20190712040027-UseMultipleProgramCodesForSoh	2019-07-30 03:09:19.514
374	/20190719032936-AddScaleTypeToCriticalMedicinesMapOverlay	2019-07-30 03:09:19.528
375	/20190719062018-ChangeTBTreatmentReportsDataSource	2019-07-30 03:09:19.538
376	/20190724044344-ChangeHouseholdsToSpectrumType	2019-07-30 03:09:19.547
377	/20190724065622-UnpluraliseImmuninsationsMapOverlayGroup	2019-07-30 03:09:19.574
378	/20190725022427-MergeImmsAndColdChainMapOverlayGroups	2019-07-30 03:09:19.608
379	/20190730060121-AddAggregationTypesToPercentageByPairs	2019-08-02 00:59:38.028
380	/20190725233059-UseEntityAttributesInSyncRecords	2019-08-21 23:38:52.566
381	/20190726005711-TransformEntityMetadataToDeepObject	2019-08-21 23:38:52.683
382	/20190728232315-SetDefaultValueForChangeDetailsToEmptyObject	2019-08-21 23:38:52.981
383	/20190730064726-DitchClinicId	2019-08-21 23:39:04.398
384	/20190731055620-AddMissingEntitiesToSyncQueue	2019-08-21 23:52:25.847
385	/20190801023410-RemoveIsFromRepeatingSurvey	2019-08-21 23:52:35.298
386	/20190813055649-RestructureCoteDivoire	2019-08-21 23:52:35.47
387	/20190814001242-AddConfigToComponents	2019-08-21 23:52:35.77
388	/20190806041106-ChangeServiceStatusReportNameAtFacilityLevel	2019-09-12 03:42:42.098
389	/20190808052641-AddMonthPeriodGranularityToReproductiveHealthVisitsbsbyTypeperMonthChart	2019-09-12 03:42:42.116
390	/20190809002248-UsePreaggregatedValuesForVaccineStockOnHand	2019-09-12 03:42:42.13
391	/20190813003811-ChangeMouseoverInfoForAverageAvailabilityMedicinesReport	2019-09-12 03:42:42.151
392	/20190815062340-AddWISHDataDownloads	2019-09-12 03:42:42.169
393	/20190816041256-UpdateStockoutsReportToUsePreaggregatedValues	2019-09-12 03:42:42.201
394	/20190819024920-FilterNoDataByDefaultFridgeBreachOverlays	2019-09-12 03:42:42.213
395	/20190904045009-RemoveProgramCodeFromVaccineSoHReport	2019-09-12 03:42:42.242
396	/20190906002434-RemoveMedicinesAvailabilityForWorld	2019-09-12 03:42:42.278
397	/20190916234616-AddCommunicableDiseasesValidationDashboard	2019-09-23 06:25:18.88
398	/20190920020842-AddCD1ValidationReport	2019-09-23 06:25:18.928
399	/20190920022005-AddCD2aValidationReport	2019-09-23 06:25:18.972
400	/20190920022020-AddCD2bValidationReport	2019-09-23 06:25:19.014
401	/20190920022026-AddCD2cValidationReport	2019-09-23 06:25:19.047
402	/20190920022027-AddCD3ValidationReport	2019-09-23 06:25:19.102
403	/20190920022028-AddCD4ValidationReport	2019-09-23 06:25:19.13
404	/20190920022029-AddCD5ValidationReport	2019-09-23 06:25:19.153
405	/20190920022030-AddCD6ValidationReport	2019-09-23 06:25:19.176
406	/20190920022031-AddCD7ValidationReport	2019-09-23 06:25:19.21
407	/20190902013112-WISHVillageUpdate	2019-09-24 00:52:49.498
408	/20190924040432-StripTongaFromCDCodes	2019-09-24 06:27:15.589
409	/20190924041100-StripTongaFromCDCodes	2019-09-24 06:28:39.273
410	/20190925230725-AddCaseEntityType	2019-09-26 06:27:48.592
411	/20191004061449-TongaCD1Tweaks	2019-10-07 05:10:53.046
412	/20191004065952-TongaCD5Tweaks	2019-10-07 05:10:53.07
413	/20191004071328-TongaCD4Tweaks	2019-10-07 05:10:53.131
414	/20191004071540-TongaCD2Tweaks	2019-10-07 05:10:53.257
415	/20190930235110-AddDHISParamsForMS1	2019-10-10 04:12:31.96
416	/20191004060225-SyncMissedEventBasedDeletes	2019-10-10 04:12:32.162
417	/20191008045126-AddIsDataRegionalInEntityMetadata	2019-10-15 02:45:31.477
418	/20191011013237-TongaCD2ICD10CodeChanges	2019-10-15 04:09:33.902
419	/20191017025014-FPValidationReportAtIslandGroups	2019-10-17 04:15:12.631
420	/20191017211946-AddFullFPValidationNationalDistrict	2019-10-18 05:26:25.369
421	/20191021021359-MS1TimelinessMapOverlay	2019-10-21 02:24:54.612
422	/20191021002826-AddMissingDeletedAnswersToSyncQueue	2019-10-21 05:34:47.778
423	/20191022002521-AddCD3aValidationReport	2019-10-25 05:22:20.434
424	/20191022002522-AddCD3bValidationReport	2019-10-25 05:22:20.485
425	/20191022234831-AddVaccineDashboardsToSolomons	2019-10-25 05:22:20.5
426	/20191023013025-AddPneumococcolVaccineToDashboards	2019-10-25 05:22:20.519
427	/20191023013111-AddVaccineMapOverlaysToSolomons	2019-10-25 05:22:20.532
428	/20191023023249-ChangeVanuatuEPIPermissionGroupToJustEPI	2019-10-25 05:22:20.545
429	/20191021215518-FixEntityIsDataRegional	2019-10-25 05:25:02.897
430	/20191028014344-AddStriveDashboard	2019-10-28 22:44:43.246
431	/20191028014345-AddDnaExtractionRecordReport	2019-10-28 22:44:43.325
432	/20191106053817-UseEntityIdsInSCRF	2019-11-11 04:01:26.644
433	/20191104075102-AddWeeklyReportedCasesReport	2019-11-11 06:22:34.42
434	/20191106001633-AddDataSourceKeyInDataBuilders	2019-11-11 06:22:34.511
435	/20191106024434-AddStriveFacilityLevelDashboardGroup	2019-11-11 06:22:34.539
436	/20191107005427-AddStriveCRFCaseClassificationsReport	2019-11-11 06:22:34.568
437	/20191107023843-AddStriveFebrileCasesBySexReport	2019-11-11 06:22:34.603
438	/20191107222443-AddSCRFRDTByResultsReport	2019-11-11 06:22:34.631
439	/20191111002915-AddFebrileIllnessByAgeGroupReport	2019-11-11 06:22:34.66
440	/20191112032026-ResyncEntityAnswers	2019-11-14 22:10:21.008
441	/20191114025038-UpdatePositiveMixedStriveQuestion	2019-11-14 22:10:21.118
442	/20191112024821-AddWeeklymRDTPositiveReport	2019-11-14 22:11:48.485
443	/20191112035536-AddWeeklyNumberOfConsultationsReport	2019-11-14 22:11:48.61
444	/20191114033625-UpdateSCRFRDTByResultsReport	2019-11-14 22:11:48.629
445	/20191115042821-AddVanuatuBirths	2019-11-18 00:52:06.285
446	/20191114232355-AddProjectTable	2019-11-20 21:36:44.295
447	/20191118044355-OperationalFacilitiesNotPublic	2019-11-20 21:36:44.34
448	/20191114222903-ChangePeriodTypeChValidationReports	2019-11-25 06:10:30.728
449	/20191119221519-UpdateProjectDefaultTheme	2019-11-25 06:10:30.758
450	/20191121001602-UpdateProjectTableEntityColumn	2019-11-25 06:10:30.781
451	/20191125001343-RemoveVUBirthsDashboard	2019-11-25 06:10:30.855
452	/20191126010956-UpdateStriveReports	2019-11-27 22:52:07.22
453	/20191114002413-DefineViewTypeForMatrix	2019-12-03 01:17:46.037
454	/20191118225434-AddWeeklyFebrileCasesReport	2019-12-03 01:17:46.169
455	/20191126003747-AddWeeklyPercentageOfPositiveMalariaConsultationsReport	2019-12-03 01:17:46.231
456	/20191126234147-AddWeeklyPercentageOfPositiveMalariaAgainstConsultationsReport	2019-12-03 01:17:46.276
457	/20191203020146-AddStriveCustomDataDownloads	2019-12-03 02:54:34.039
458	/20191202054031-AddTotalMeaslesCasesByDistrictRadius	2019-12-03 05:31:16.044
459	/20191203014952-AddTotalMeaslesCasesByDistrictSpectrum	2019-12-03 05:31:16.095
460	/20191203215238-ChangePositiveCountCalculation	2019-12-03 22:32:11.883
461	/20191203041304-AddMeaslesCasesByGender	2019-12-04 05:41:04.242
462	/20191203051650-AddMeaslesCasesByAgeGroup	2019-12-04 05:41:04.318
463	/20191203054012-UpdateMeaslesOverlayNames	2019-12-04 05:41:04.329
464	/20191204020310-AddCD8ValidationReport	2019-12-04 05:41:04.367
465	/20191204032509-HeatmapColorGradient	2019-12-04 05:41:04.378
466	/20191206003710-RenameSumDataBuilders	2019-12-06 07:27:56.012
467	/20191206025531-AddCD8ValidationReportAtCountryLevel	2019-12-06 07:27:56.129
468	/20191206053437-AddMeaslesCasesPer10kPax	2019-12-06 07:27:56.191
469	/20191206064413-AddPercentageValueTypeForCriticalItemAvailability	2019-12-06 07:27:56.201
470	/20191210002602-CD3bRemoveDateSelector	2019-12-12 00:18:00.546
471	/20191114030520-FixImportDeleteCountsForUpdates	2019-12-12 00:26:42.232
472	/20191114044010-SingleDhisReferencePerRecord	2019-12-12 00:26:45.795
473	/20191212221249-UpdateSTRIVEPermissions	2019-12-13 05:05:39.287
474	/20191210055005-CoconutRewardUpdate	2019-12-17 23:27:40.851
475	/20191127033638-ChangeSiteColumnConfig	2019-12-18 21:52:56.168
476	/20191216015926-RemoveOrgUnitIsGroupFromConfig	2019-12-18 21:52:56.192
477	/20191216220622-RemoveVitiLevuRegionFromFiji	2019-12-18 21:52:56.251
478	/20191216041125-ResyncVillagesAsOrgUnits	2019-12-18 23:06:40.746
479	/20191213030728-UpdateSTRIVEDashboardNames	2019-12-19 00:45:13.03
480	/20191216225125-UpdateWeeklyFebrileCasesReportName	2019-12-19 00:45:13.05
481	/20191216233942-UpdatePositiveMalariaConsultationsReport	2019-12-19 00:45:13.063
482	/20191216235755-ChangeSTRIVEWeeklyReportedCasesReportName	2019-12-19 00:45:13.077
483	/20191216002240-MapOverlayPercentage	2019-12-19 05:49:15.025
484	/20191217044009-TongaVillageAnswersToEntityIds	2019-12-20 06:46:51.008
485	/20191218040525-TongaVillageAnswersToPrimaryEntities	2019-12-20 06:46:56.316
486	/20191219231942-TongaCD3CaseParentsToVillages	2019-12-20 06:46:56.678
487	/20191220032822-DeleteTongaVillageAnswers	2019-12-20 06:46:58.623
488	/20191118051744-RenameViewModeDashboardGroupColumn	2019-12-20 06:48:15.211
489	/20191121231722-AddProjectCodeForeignKeyForDashboardGroups	2019-12-20 06:48:15.321
490	/20191208223633-AddDefaultMeasureColumnToProjectTable	2019-12-20 06:48:15.349
491	/20191208223643-RemoveProjectCodeFromDashboardGroupsAndAddDashboardGroupNameToProjects	2019-12-20 06:48:15.373
492	/20191208223743-AddProjectsToTable	2019-12-20 06:48:15.431
493	/20191208233743-AddUnfpaDashboardGroups	2019-12-20 06:48:15.491
494	/20191208233747-AddUnfpaMethodsAvailableCharts	2019-12-20 06:48:15.617
495	/20191209031534-AddUNFPARHContraceptiveMethodsOfferedReports	2019-12-20 06:48:15.651
496	/20191209061626-AddUnfpaFacilitiesOfferingServicesAndDelivery	2019-12-20 06:48:15.746
497	/20191217043147-RemoveThemeAndAddLogoProjectColumns	2019-12-20 06:48:15.756
498	/20191217051444-UpdateProjectImageUrls	2019-12-20 06:48:15.773
499	/20191220004141-UpdateProjectUserGroups	2019-12-20 06:48:15.787
500	/20191219040555-ShowEventOrgUnitInTongaCDReports	2019-12-23 22:58:29.845
503	/20191221032822-UseOriginalTimezoneForDateAnswers	2019-12-29 22:12:32.173
504	/20191230030956-UseVillageInCH4Report	2020-01-14 04:36:03.125
505	/20200102222808-AddTongaUNFPADashboardGroupsAndReports	2020-01-14 04:36:03.199
506	/20200103035630-UseVillageInCH11Report	2020-01-14 04:36:03.564
507	/20200103041050-AddUNFPAStockCardReports	2020-01-14 04:36:03.63
508	/20200103051018-MakeCHValidationReportIdsConsistent	2020-01-14 04:36:04.697
509	/20200106033541-AddEntityTypeInCDOverlays	2020-01-14 04:36:04.805
510	/20200107043937-RemoveColumnFromCD3aReport	2020-01-14 04:36:04.853
511	/20200109052723-ConsolidatePNGCaseReportFormExportDateColumns	2020-01-16 19:28:42.56
512	/20191218232516-EmailConfirmation	2020-01-21 21:03:51.508
513	/20200109231002-AddLabelTypeToViewJsonOnReports	2020-01-21 21:03:51.571
514	/20200114105007-PercentageEventCountsBuildersUseFractionAndPercentageLabel	2020-01-21 21:03:51.598
515	/20200115052004-AddTongaAndMicronesiaToUnfpaProjectCountries	2020-01-21 21:03:51.764
516	/20200114233039-AddFMUnfpaDashboardGroup	2020-01-23 04:41:01.57
517	/20200110032903-ConvertSingleColumnTableTO-CHDashboardReportsToTableOfDataValues	2020-02-04 03:03:39.028
518	/20200113052422-ConvertTableFromDataElementGroupsTO-CHDashboardReportsToTableOfDataValues	2020-02-04 03:03:39.084
519	/20200115003324-ConvertTO-RHDashboardReportsToTableOfDataValues	2020-02-04 03:03:39.218
520	/20200117042010-ConvertRemainingTODashboardReportsToTableOfDataValues	2020-02-04 03:03:39.325
521	/20200129031634-ChangeNoCountryCode	2020-02-04 03:03:39.339
522	/20200129031728-AddNewCountriesToEntityTable	2020-02-04 03:03:39.399
523	/20200131041935-DeleteRedundantImmsBreaches	2020-02-04 03:05:23.343
524	/20200202205145-DeleteTongaSpecificDashboardsFromDemoLand	2020-02-04 20:41:17.744
525	/20200128054247-UsePerOrgUnitDataBuilderForUNFPAStockCardsReport	2020-02-06 22:32:27.446
526	/20200123233519-UnfpaStaffTrainingDashboard	2020-02-13 01:01:20.644
527	/20200129040859-InsertIHRWorldDashboardGroup	2020-02-13 01:01:20.708
528	/20200131023339-ContraceptionDashboardUpdate	2020-02-13 01:01:20.767
529	/20200205015401-DeleteCD2-2Answers	2020-02-13 01:01:20.979
530	/20200206214233-AddColumnsToApiRequestLog	2020-02-13 01:01:41.369
531	/20200206214234-RenameAndCleanupInstallId	2020-02-13 01:01:42.451
532	/20200206221246-AddColumnsToMeditrakDevice	2020-02-13 01:01:42.58
533	/20200206221247-AddMeditrakDeviceIdToRefreshToken	2020-02-13 01:01:42.728
534	/20200206221249-AddRefreshTokenToApiRequestLog	2020-02-13 01:01:42.825
535	/20200207044948-AddBonrikiEastToMs1Api	2020-02-13 01:01:42.858
536	/20200207045423-IHRSparReportingCountries	2020-02-13 01:01:42.884
537	/20200210233650-SwitchRowsAndColsForTongaFP01	2020-02-13 01:01:43.71
538	/20200214025142-UpdateStriveWeeklyMRDTPositiveConfig	2020-02-14 04:29:20.453
539	/20200212220350-optimiseWorldFetchData	2020-02-21 01:49:23.321
540	/20200220231953-DeleteSubmissionDateColumnsCD1CD2	2020-02-21 01:49:23.504
541	/20200129040800-InsertIHRCountryReport	2020-02-25 02:34:20.799
542	/20200219235149-AddIHRReportBAndAddBothToGroup	2020-02-25 02:34:20.871
543	/20200224235334-SPARReportHeader	2020-02-25 02:34:20.912
544	/20200116211310-AddDataSourceTable	2020-02-25 06:32:54.799
545	/20200122003753-ConvertDataElementToCodeInSyncLog	2020-02-25 06:34:46.657
546	/20200128021719-AddTongaDataSources	2020-02-25 06:34:52.487
547	/20200129211641-AvoidChangeTimeConflicts	2020-02-25 06:35:32.595
548	/20200204005927-AddDataElementDataGroupTable	2020-02-25 06:35:33.014
549	/20200205004208-AddTongaSurveysToDataSource	2020-02-25 06:35:34.554
550	/20200210004010-SimplifyChangeNotification	2020-02-25 06:35:34.635
551	/20200211002034-UpdateDataBuilders	2020-02-25 06:35:35.82
552	/20200218001344-UpdateMapOverlays	2020-02-25 06:35:36.08
553	/20200218025613-AddDataGroupsToDataSource	2020-02-25 06:35:36.393
554	/20200218215230-ResyncAllTongaData	2020-02-25 06:38:31.217
555	/20200224063900-UseSingleDataElementForDMHTNDenominator	2020-02-25 06:38:31.776
556	/20200224003036-AddIHRJEEMatrixReport	2020-02-26 06:05:41.669
557	/20200228013730-DeleteRedundantImmsBreaches	2020-02-28 02:41:25.468
558	/20200227001738-AddWeeklyNumberOfFebrileIllnessCasesByVillageReport	2020-03-03 01:20:17.167
559	/20200228040157-MoveAutocompletePrimaryEntityToEntityId	2020-03-03 01:20:17.278
560	/20200302202141-ReinstateBuildingRecordInChangeNotifier	2020-03-05 08:54:21.288
561	/20200305051343-ClearNullSyncQueueDetails	2020-03-05 08:54:22.972
562	/20200305053046-AddDataSourceForCD3b-014b-C19-9	2020-03-05 08:54:31.999
563	/20200303043257-PercentageOfValueCountsSplitCodesFromValueConfig	2020-03-11 04:55:06.369
564	/20200305043430-UpdateStockCardsReportConfig	2020-03-11 04:55:06.448
565	/20200310020604-MatrixTableNameChange	2020-03-11 04:55:06.488
566	/20200311003701-UpdateMatrixHeader	2020-03-11 04:55:06.547
567	/20200311013245-AddProgramCodeToHP05DrillDown	2020-03-11 04:55:06.65
568	/20200312003031-AddAggregationEntityTypeInMapOverlays	2020-03-17 02:50:54.528
569	/20200312223135-AddWeeklyReportedFebrileIllnessCasesToVillages	2020-03-17 02:50:55.835
570	/20200313000357-AddGeneralDashboardGroupToVillages	2020-03-17 02:50:56.013
571	/20200316010349-AddWeeklyNumberOfFebrileIllnessReportsNational	2020-03-24 05:41:33.358
572	/20200316022146-AddStriveRegionalDashboardGroup	2020-03-24 05:41:33.414
573	/20200316022217-AddWeeklyNumberOfFebrileIllnessReportsRegional	2020-03-24 05:41:33.527
574	/20200316042719-AddMRDTDashboardReportToNationalAndProvincial	2020-03-31 07:11:24.146
575	/20200316055056-Add2YAxisMRDTFebrileIllnessDashboardReportToNationalAndProvincialStrive	2020-03-31 07:11:24.247
576	/20200318223935-DeleteErroneousStriveSurveyData	2020-03-31 07:11:24.303
577	/20200323002803-AddCovid19AustraliaToProjects	2020-03-31 07:20:42.006
578	/20200324032850-AddCOVID19DashboardgroupsAusNationalState	2020-03-31 07:20:42.109
579	/20200324050422-AddCovid19StateDashboardReport	2020-03-31 07:20:42.167
580	/20200324053202-AddCasesByStateReportCovidAus	2020-03-31 07:20:42.238
581	/20200325001848-AddTotalNumberReportedCasesCOVIDAUMapOverlay	2020-03-31 07:20:42.27
582	/20200326012240-MoveDefaultDashboardGroupsToIndividualCountries	2020-03-31 07:20:42.62
583	/20200326032657-AddTotalCasesByStateAus	2020-03-31 07:20:42.685
584	/20200326034630-AddTotalCovidCasesByTypeReport	2020-03-31 07:20:42.741
585	/20200326043343-AddCovidNewCasesByDayBarChartStateAus	2020-03-31 07:20:42.813
586	/20200326045458-AddCovid19NationalDailyCasesOverTimeEachStateAndTotalDashboard	2020-03-31 07:20:42.922
587	/20200326225508-FixDailyCovidStateNumbersReportAus	2020-03-31 07:20:42.968
588	/20200326233613-FixDailyCovidCasesByStateChart	2020-03-31 07:20:43.004
589	/20200327014704-AddNationalNewCovidCasesByDayAus	2020-03-31 07:20:43.106
590	/20200327052900-UpdateCovidAuTotalConfirmedCasesMapOverlayScaleMin	2020-03-31 07:20:43.126
591	/20200327055605-UpdateCovidAuTotalConfirmedCasesOverTimeByStateWordings	2020-03-31 07:20:43.177
592	/20200330013822-ChangeGeographicalBoundsOfWorld	2020-03-31 07:20:43.211
593	/20200330014731-MoveDefaultMapOverlaysToIndividualCountries	2020-03-31 07:20:43.315
594	/20200330023425-AddDailyToCovid19Reports	2020-03-31 07:20:43.343
595	/20200330025955-ChangeIdOfDashboardReportToRemoveState	2020-03-31 07:20:43.392
596	/20200330034009-AddSubDistrictAndFacilityLevelDashboardGroups	2020-03-31 07:20:43.429
597	/20200330034023-AddLinkToSourcesCovidAllOrgLevels	2020-03-31 07:20:43.463
598	/20200330041343-RemoveRecoveriesFromDashboardCovid	2020-03-31 07:20:43.489
599	/20200330233911-ChangeDefaultDataToYesterdayCovidReports	2020-03-31 07:20:43.515
600	/20200317055123-AddStriveReportsToVillages	2020-04-07 04:56:55.638
601	/20200325044717-MakeFebrileIllnessCaseCalculationConsistent	2020-04-07 04:56:55.711
602	/20200403020133-UpdateDataSourcetoReflectHP01andHP02Changes	2020-04-07 04:56:56.472
603	/20200407021657-AddDisasterDashboardGroupForVanutatu	2020-04-07 04:56:56.557
604	/20200324034720-CreateMSupplyUNFPAMatrices	2020-04-20 02:20:13.418
605	/20200325002500-RefactorOrganisationUnitTableReportsToTableOfValueForOrgUnits	2020-04-20 02:20:13.705
606	/20200330044935-AddConfigToIHRReportsForOrgUnitColumns	2020-04-20 02:20:13.744
607	/20200401220823-RemoveWordTodayFromCovidReports	2020-04-20 02:20:13.807
608	/20200402024847-AddProjectEntity	2020-04-20 02:20:18.061
609	/20200402024848-CreateProjectHierarchy	2020-04-20 02:20:18.307
610	/20200403015828-AddCovidRawDataDownloadTonga	2020-04-20 02:20:18.356
611	/20200403030413-AddPeriodDataSwitchToDashBoardReports	2020-04-20 02:20:18.451
612	/20200405231416-AddIpcCommodityAvailabilityReport	2020-04-20 02:20:19.08
613	/20200406000236-AddFacilityCommoditiesOverlays	2020-04-20 02:20:19.235
614	/20200406062057-AddCovidICUAndIsolationBedsOverlaysTonga	2020-04-20 02:20:19.28
615	/20200407002449-AddStriveStackedBarmRDTByResultReport	2020-04-20 02:20:19.331
616	/20200407052132-AddSOHandAMCMatricesToUNFPA	2020-04-20 02:20:19.532
617	/20200408054558-AddCaseContactEntityType	2020-04-20 02:20:20.888
618	/20200409013211-AddAddCovidTestsPerCapitaReport	2020-04-20 02:20:20.951
619	/20200409065901-AddStripFromDataElementNamesForUNFPAMatrices	2020-04-20 02:20:20.969
620	/20200415061542-AddStriveOverlayTotalConsultationsWTFBubble	2020-04-20 02:20:21.031
621	/20200416060614-UpdateMOSUnpfaMedicinesToTrafficLightsConfig	2020-04-20 02:20:21.049
622	/20200331033941-CreateUNFPADeliveryServicesLineCharts	2020-04-24 06:48:49.22
623	/20200403054119-SwapDataElementsForRHCStockCardsChart	2020-04-24 06:48:49.294
624	/20200408015324-AddTestsConductedDashboardAus	2020-04-24 06:48:50.08
625	/20200408052334-AddSamoaCovidRawDataDownloadDashboard	2020-04-24 06:48:50.208
626	/20200408065558-AddDenominatorAggregationFlagToUNFPAReport	2020-04-24 06:48:50.258
627	/20200416033713-ReplaceProvinceInDashboardGroup	2020-04-24 06:48:50.573
628	/20200416033714-ReplaceAndRemoveRegionEntityType	2020-04-24 06:49:06.988
629	/20200416033715-ReplaceRegionInMapOverlays	2020-04-24 06:49:07.184
630	/20200416033716-UseLowercaseOrgUnitLevel	2020-04-24 06:49:07.375
631	/20200416033717-ReplaceRegionInSurveyScreenComponent	2020-04-24 06:49:10.617
632	/20200416033718-RenameOrganisationUnitLevelInDashboardReport	2020-04-24 06:49:10.677
633	/20200406042212-AddCovidTotalDeathsVsCasesByDay	2020-04-27 23:26:41.019
634	/20200406044451-AddCovidCumulativeDeathsVsCases	2020-04-27 23:26:41.204
635	/20200409012830-Migrate-old-facility-BCD1-data	2020-04-27 23:26:41.921
636	/20200421000451-AddTongaCovidIpcCommodityAvailabilityDashboard	2020-04-27 23:26:42.244
637	/20200427015657-AddReproductiveHealthStockOverlays	2020-04-28 22:12:23.004
638	/20200428033101-RenamePngVillageCodes	2020-05-01 05:42:53.356
639	/20200428035406-UpdateUNFPACountriesAndDashboards	2020-05-01 05:42:56.096
640	/20200130050502-ReconcileClinicEntities	2020-05-12 05:53:40.85
641	/20200401030503-AddFacilityTypeMapOverlayForAustralia	2020-05-12 05:53:41.026
642	/20200401033652-RemoveAccessToOperationalFacilitiesForAU	2020-05-12 05:53:41.105
643	/20200427073641-AddUNFPAFacilityMosReport	2020-05-12 05:53:41.446
644	/20200428051149-AddUNFPADemoLandDashboardGroup	2020-05-12 05:53:41.536
645	/20200428051160-AddUNFPAReportToDLDashboardGroup	2020-05-12 05:53:41.597
646	/20200428063651-UpdateServiceListReportToHaveNewFilterConfig	2020-05-12 05:53:41.701
647	/20200428144225-UpdateCovidNewCaseByDayDataBuilderConfig	2020-05-12 05:53:41.813
648	/20200429010300-AddUNFPAReproductiveHealthProductAverageMonthlyConsumptionReport	2020-05-12 05:53:42.113
649	/20200429043336-AddCommunicableDiseasesDashboardGroup	2020-05-12 05:53:42.185
650	/20200429043517-AddSTITestStatusNumberOfPatientsTestedReport	2020-05-12 05:53:42.401
651	/20200430030959-UpdateWeeklyMalariaPerCasesDenominator	2020-05-12 05:53:42.452
652	/20200501000604-AddTongaDHIS2OutcomeOfContactTracing	2020-05-12 05:53:42.657
653	/20200504012216-ChangeFilterToCustomFilterInPercentagesOfValueCountsPerPeriodDataBuilderConfig	2020-05-12 05:53:42.781
654	/20200505143813-AddTongaDHIS2MedicalCertificatesDistributedReport	2020-05-12 05:53:43.201
655	/20200505222240-updateTongaPehsMatrixIncFacType	2020-05-12 05:53:43.305
656	/20200506040950-UpdateSumPerPeriodDataBuilderConfigInReports	2020-05-12 05:53:43.985
657	/20200507033858-AddAttributesToEntityTable	2020-05-12 05:53:54.462
658	/20200326052907-AddStriveReportFebrileIllnessAndRDTPositive	2020-05-13 03:13:08.331
659	/20200405234315-AddStriveReportFebrileCasesByWeek	2020-05-13 03:13:08.484
660	/20200406010511-AddRDTTotalTestsVsPercentagePositiveComposedReportStrive	2020-05-13 03:13:08.623
661	/20200406013942-AddStriveVillageFebrileIllessDiscreteShadedPolygonsMapOverlay	2020-05-13 03:13:08.687
662	/20200406061858-AddStriveVillagePercentMRDTPositiveShadedSpectrumMapOverlay	2020-05-13 03:13:08.745
663	/20200407044756-Add3TypeOfStriveVillagePercentMRDTPositiveShadedSpectrumMapOverlay	2020-05-13 03:13:08.84
664	/20200408002104-AddStriveFacilityRadiusOverlayTestNumber	2020-05-13 03:13:09.046
665	/20200408044353-Add4StriveMapOverlays	2020-05-13 03:13:09.378
666	/20200414065121-AddStriveOverlayPercentmRDTPositiveAndTestsSourceWTF	2020-05-13 03:13:09.515
667	/20200415034908-AddStriveOverlayAllCasesByFacilityBubbleCRF	2020-05-13 03:13:09.593
668	/20200424054821-ShiftAnnualFanafanaolaDashboardsToShowPreviousYearData	2020-05-13 03:13:09.662
669	/20200504025438-UseNumberValueForDataValueFilter	2020-05-13 03:13:09.751
670	/20200504065336-UseNumberForValueFilterInOverlays	2020-05-13 03:13:09.834
671	/20200512023653-UseNumberForValueFilterInReports	2020-05-13 03:13:09.938
672	/20200513022041-UpdateRdtTestsTotalConfig	2020-05-13 03:13:10.011
673	/20200430065532-AddTongaNotifiableDiseasesStackedBar	2020-05-13 05:15:17.737
674	/20200505233853-AddTongaIsolationAdmissionsInitialDiagnosisStackedBar	2020-05-13 05:15:18.125
675	/20200505234922-AddTongaSuspectedCasesNotifiableDiseasesStackedBar	2020-05-13 05:15:18.248
676	/20200506001638-AddTongaContactsTracedStackedBar	2020-05-13 05:15:18.376
677	/20200506041900-AddLabConfirmedSTICasesPerMonthReport	2020-05-13 05:15:18.471
678	/20200416023232-ShiftFanafanaolaDashboardsToShowPreviousMonthData	2020-05-18 05:15:38.271
679	/20200429021341-AddUNFPAReproductiveHealthProductsMonthOfStockReport	2020-05-18 05:15:38.491
680	/20200504224323-AddSchoolEntityType	2020-05-18 05:15:41.126
681	/20200520034215-RemoveDhisIntegrationMetadataForLaosSchoolsSurveys	2020-05-20 08:06:10.353
682	/20200505015116-AddEntityHierarchyIdToProjectTable	2020-05-22 04:53:18.839
683	/20200506031906-ChangeRootEntityToProjects	2020-05-22 04:53:20.049
684	/20200506224325-AddLaosSchoolsProject	2020-05-22 04:53:20.474
685	/20200507020955-AddLaosSchoolAlternativeHierarchyRelations	2020-05-22 04:53:35.326
686	/20200507070444-AddLaosSchoolsSchoolTypeMapOverlay	2020-05-22 04:53:35.509
687	/20200513054910-AddLaosSchoolsRadiusOverlays	2020-05-22 04:53:35.744
688	/20200513063247-AddLaosSchoolBinaryMeasureMapOverlays	2020-05-22 04:53:35.894
689	/20200513230725-AddLaosSchoolsDevPartnerOverlay	2020-05-22 04:53:36.095
690	/20200514014908-AddProjectDashboardGroups	2020-05-22 04:53:36.374
691	/20200514045247-RemoveWorldAsChildOfProjects	2020-05-22 04:53:36.667
692	/20200514144900-AddLaosSchoolNumberOfChildrenHeatMap	2020-05-22 04:53:36.845
693	/20200515041112-AddTupaiaToDataSourceServiceTypes	2020-05-22 04:53:41.052
694	/20200518011240-AddDevelopmentPartnerPinOverlay	2020-05-22 04:53:41.138
695	/20200518035908-AddDefaultValueForDataSourceConfig	2020-05-22 04:53:41.173
696	/20200518035909-UseTupaiaAsDataServiceForLaosSchoolsSurveys	2020-05-22 04:53:43.205
697	/20200519020537-AddLaosSchoolsDormitoryMapOverlay	2020-05-22 04:53:43.376
698	/20200520071141-FixCaseInLaosSchoFixCaseInLaosSchoolsOverlays	2020-05-22 04:53:43.491
699	/20200520090416-UpdateMapOverlaysDormitorySchools	2020-05-22 04:53:43.52
700	/20200520112832-FixGroupingValuesInLaosSchoolsBinaryMeasuresOverlays	2020-05-22 04:53:43.716
701	/20200520223152-UpdateMapOverlaysDevPartners	2020-05-22 04:53:43.911
702	/20200521062959-AddIHRDashboardGroupToExplore	2020-05-22 04:53:44.003
703	/20200522020712-SetLaosSchoolsDefaultDashboardAndOverlay	2020-05-22 04:53:44.032
704	/20200514054511-AddBinaryShadedPolygonMeasuresLaosSchools	2020-05-22 06:36:37.011
705	/20200515021226-AddLaosSchoolShadedPolygonsForDropOutRatesDistrictLevel	2020-05-22 06:36:37.239
706	/20200517062602-AddLaosSchoolShadedPolygonsForRepetitionRatesDistrictLevel	2020-05-22 06:36:37.513
707	/20200518004335-AddLaosSchoolDashboardGroups	2020-05-22 06:36:37.763
708	/20200518020921-AddLaosSchoolsMaleFemalePieCharts	2020-05-22 06:36:38.023
709	/20200519074549-AddLaosSchoolShadedPolygonsForDropOutRatesProvinceLevel	2020-05-22 06:36:38.222
710	/20200519074621-AddLaosSchoolShadedPolygonsForRepetitionRatesProvinceLevel	2020-05-22 06:36:38.381
711	/20200520044744-AddDropoutAndRepeatRatesByGradeBarLaosSchools	2020-05-22 06:36:38.648
712	/20200520223705-AddLaosSchoolsLanguageOfStudentsPieChart	2020-05-22 06:36:38.777
713	/20200521034842-AddLaosSchoolBinaryDashbaord	2020-05-22 06:36:38.865
714	/20200521055848-RemoveUnwantedDataVisualizationsFromLaos	2020-05-22 06:36:39.074
715	/20200521215551-AddBCD1ToInternalDataFetch	2020-05-22 06:36:39.228
716	/20200521221711-FixLaosSchoolsBinaryMeasureMapOverlayNameTypo	2020-05-22 06:36:39.349
717	/20200521221800-UpdateLaosSchoolsPieChartsDataServices	2020-05-22 06:36:39.552
718	/20200522020600-FixNamesForLaosSchoolsOverlays	2020-05-22 06:36:39.714
719	/20200522031911-laosSchoolsFixUnicefCode	2020-05-22 06:36:39.753
720	/20200522032405-UpdateMapOverlayHeadings	2020-05-22 06:36:39.887
721	/20200522055413-ChangeLaosSchoolsOverlayGroupName	2020-05-22 06:36:39.921
722	/20200503063358-AddTongaDHIS2HealthCertificatesDistributedReport	2020-05-26 05:33:22.248
723	/20200508034036-UpdateDefaultTimePeriodFormatInDataBuilderConfig	2020-05-26 05:33:22.404
724	/20200522010341-updateLaosSchoolsBinaryDashboard	2020-05-26 05:33:22.531
725	/20200525044209-NoFunnyPeriods	2020-05-26 05:33:22.587
726	/20200526005827-RemoveWorldDashboardGroups	2020-05-26 05:33:22.618
727	/20200212052756-RemoveRedundantQuestionsWish	2020-05-28 07:05:49.153
728	/20200521005057-AddLaosDevelopmentPartnersReport	2020-05-28 07:05:49.46
729	/20200524231548-AddSchoolPercentDashboards	2020-05-28 07:05:50.058
730	/20200522022756-VisualisationsDefinedPerProject	2020-06-01 23:11:11.261
731	/20200524212939-LimitVisualisationsPerProject	2020-06-01 23:11:12.839
732	/20200528042309-DeleteAnswersForLaosSchoolsSelectVillageQuestions	2020-06-01 23:11:13.004
733	/20200521102324-AddUtilityServiceBinaryMeasuresBarCharts	2020-06-05 05:09:17.476
734	/20200521155232-AddResourceSupportBinaryMeasuresBarCharts	2020-06-05 05:09:17.765
735	/20200528011043-ChangeUNFPAReportsToUseQuarters	2020-06-05 05:09:17.857
736	/20200605045409-CorrectStriveDashboardCase	2020-06-05 05:09:17.912
737	/20200605051613-SetCovidDefaultDashboard	2020-06-11 22:06:48.088
738	/20200608220007-RenameQuestionIndicatorToName	2020-06-11 22:06:48.184
739	/20200608234924-RemoveLaosSchoolsReport	2020-06-11 22:06:48.527
740	/20200609022031-RemoveLaosSchoolsHeatmaps	2020-06-11 22:06:48.594
741	/20200609022859-UpdateOverlayHeadingsToRemoveTotal	2020-06-11 22:06:48.938
742	/20200612003644-AddMostVisualisationsToExplore	2020-06-12 01:09:53.702
743	/20200417211027-AllowNullAccessToken	2020-06-18 21:35:02.61
744	/20200422231733-MoveNoCountryUsersToAdminPanel	2020-06-18 21:35:02.717
745	/20200423213702-EntityBasedPermissions	2020-06-18 21:35:03.473
746	/20200525005457-WipeUserSessions	2020-06-18 21:35:03.546
747	/20200529000003-MigrateOverlaysToUseNewEntityAggregation	2020-06-18 21:35:05.868
748	/20200529064523-MoveMeasureLevelToPresentationOptions	2020-06-18 21:35:07.96
749	/20200601050232-MigrateReportsToUseNewEntityAggregation	2020-06-18 21:35:08.941
750	/20200602035743-FixConfigForSurveyExportReports	2020-06-18 21:35:11.342
751	/20200603012534-DeleteSurveyAndQuestionImageData	2020-06-18 21:35:11.364
752	/20200603012535-ChangeDuplicateSurveyCodes	2020-06-18 21:35:15.127
753	/20200603014358-AddUniqueCodeConstraintInSurvey	2020-06-18 21:35:15.193
754	/20200603032358-UseCountrySpecificBcdSurveys	2020-06-18 21:35:15.822
755	/20200609002315-UpdateSchoolBinaryListMeasures	2020-06-18 21:35:15.925
756	/20200609045707-UpdateLaosSchoolsBinaryMeasureMapOverlayNames	2020-06-18 21:35:16.046
757	/20200609045724-RemoveLaosSchoolsBinaryMeasureMapOverlays	2020-06-18 21:35:16.083
758	/20200609053914-UseTupaiaAsDataServiceForNewLaosSchoolSurveys	2020-06-18 21:35:18.666
759	/20200609055929-AddMoreLaosSchoolsBinaryMeasuresMapOverlays	2020-06-18 21:35:18.939
760	/20200609072253-AddLaosSchoolsStudentResourcesMapOverlays	2020-06-18 21:35:19.174
761	/20200609223042-AddWaterSupplyMapOverlay	2020-06-18 21:35:19.443
762	/20200612021300-FixIncorrectDashboardGroupProjects	2020-06-18 21:35:19.63
763	/20200616000806-FixIncorrectDataElementCodesLaosReport	2020-06-18 21:35:19.97
764	/20200617235154-FixTongaMeaslesOverlaysWithEntityAggregation	2020-06-18 21:35:20.008
765	/20200618090311-FixEntityAggregationConfig	2020-06-18 21:35:20.071
766	/20200603115106-AddCatchmentEntityType	2020-06-25 23:29:10.306
767	/20200615021108-AddLaosSchoolsMajorDevPartner	2020-06-25 23:29:11.339
768	/20200618012039-UseTuapaiaAsDataServiceForWishSurveys	2020-06-25 23:29:15.379
769	/20200528043308-createAccessRequestTable	2020-07-02 21:55:46.686
770	/20200603121401-CreateFijiCatchmentAlternateHierarchy	2020-07-02 21:55:54.593
771	/20200615045558-AddPopupHeaderFormatToLaosSchoolsOverlays	2020-07-02 21:55:54.946
772	/20200623065126-AddRegionalMapOverlaysForUNFPAMOS	2020-07-02 21:55:55.446
773	/20200625074843-AddMapOverlaysForRHServices	2020-07-02 21:55:55.695
774	/20200701064429-AddMethodsOfContraceptionRegionalDashboards	2020-07-02 21:55:55.794
775	/20200609034143-ChangeBinaryShadedPolygonsMeasuresLaosSchools	2020-07-09 22:25:52.91
776	/20200609045620-AddStriveReportToNationalLevel	2020-07-09 22:25:53.039
777	/20200617035342-AddCountryAndFacilityTongaHealthPromotionUnitDashboardGroups	2020-07-09 22:25:53.489
778	/20200617036620-AddActivitySessionsBySettingPieChartTonga	2020-07-09 22:25:53.753
779	/20200617045942-AddTongaDHIS2HPUPieChartNumberOfBroadcastsByTheme	2020-07-09 22:25:53.961
780	/20200617054710-AddActivitySessionsBySettingByDistrict	2020-07-09 22:25:54.214
781	/20200617071021-AddTongaHPUBarChartTotalPhysicalActivityParticipants	2020-07-09 22:25:54.33
782	/20200618014723-AddNewQuitlineCallsByYearTextReport	2020-07-09 22:25:54.465
783	/20200618131934-AddTongaHPUIECRequestsFulFilledByTargetGroupDashboardReport	2020-07-09 22:25:54.587
784	/20200618132339-AddTongaHPUIECRequestsFulFilledByThemeDashboardReport	2020-07-09 22:25:54.766
785	/20200619015233-AddNewQuitlineCasesBarReportTonga	2020-07-09 22:25:54.939
786	/20200623013336-AddTongaHPUNumberOfNCDRiskFactorScreeningEventsBySetting	2020-07-09 22:25:55.197
787	/20200624061918-AddUnfpaStackedBarGraphPercentCountryMos	2020-07-09 22:25:55.416
788	/20200624141424-AddUNFPAReproductiveHealthAtLeast1StaffMemberTrainedSRHServicesReport	2020-07-09 22:25:55.609
789	/20200626014357-AddUNFPAFacilityUseOfStockCardsMatrixReport	2020-07-09 22:25:55.765
790	/20200629134316-AddUNFPANumberOfWomenProvidedSRHServicesFacilityLevelDashboardReport	2020-07-09 22:25:55.895
791	/20200701000910-AddUNFPANumberOfWomenProvidedSRHServicesNationalProvincialLevelMatrix	2020-07-09 22:25:55.966
792	/20200502045201-AddFlutrackingParticipantsPerCapita	2020-07-16 21:41:43.261
793	/20200503031746-Add9FlutrackingOverlays	2020-07-16 21:41:44.48
794	/20200503043133-UpdateTongaHouseholdsToUseNeutralScale	2020-07-16 21:41:44.537
795	/20200510011141-AddFlutrackingOverlaysToLGALevel	2020-07-16 21:41:44.987
796	/20200521080146-AddLaosSchoolsBinaryMatrixDistrictLevelDashboard	2020-07-16 21:41:45.202
797	/20200601041635-HideUnncessarySurveysFromDemoLand	2020-07-16 21:41:45.42
798	/20200603043404-UpdateFlutrackingOverlaysToHaveAProject	2020-07-16 21:41:45.64
799	/20200609003258-AddLaosSchoolsRawDataDownloads	2020-07-16 21:41:45.829
800	/20200624001356-AddTongaCovid19CommodityAvailabilityRadiusMapNationalLevelOverlay	2020-07-16 21:41:46.063
801	/20200624043629-AddUNFPAPriorityLifeSavingMedicinesForWomenAndChildrenAMCMatrixReport	2020-07-16 21:41:46.186
802	/20200624090309-AddUNFPAPriorityLifeSavingMedicinesForWomenAndChildrenMOSMatrixReport	2020-07-16 21:41:46.411
803	/20200624090446-AddUNFPAPriorityLifeSavingMedicinesForWomenAndChildrenSOHMatrixReport	2020-07-16 21:41:46.611
804	/20200705044221-AddLaosSchoolsDistanceFromMainRoadMapOverlay	2020-07-16 21:41:46.906
805	/20200706011442-UpdateMultiBarBarChartPercentageOfUtilityAvailabilityOfSchoolsLaosSchools	2020-07-16 21:41:47.138
806	/20200706023151-UpdateMultiBarBarChartPercentageOfResourcesSupportReceivedOfSchoolsLaosSchools	2020-07-16 21:41:47.511
807	/20200706073546-UpdateMajorDevelopmentPartnerOverlayToDevelopmentPartnerSupportOverlay	2020-07-16 21:41:47.618
808	/20200710014909-FixFlutrackingOverlaysWithEntityAggregation-modifies-data	2020-07-16 21:41:47.934
809	/20200710081638-AddUNFPARepHealthProdMOSReportToProvinceLevel-modifies-data	2020-07-16 21:41:48.106
810	/20200710131831-AddRHOverlayToMsupplyCountries-modifies-data	2020-07-16 21:41:48.209
811	/20200712224256-ChangeDefaultCovidOverlayToStateTotalCases-modifies-data	2020-07-16 21:41:48.261
812	/20200713035339-FixVaccineReportReorderCells-modifies-data	2020-07-16 21:41:48.317
813	/20200715235459-AddGPSTagAndAbilityToAttachPhotoToLaosSchools-modifies-data	2020-07-16 21:41:48.452
814	/20200428025025-createAlertsTable	2020-07-23 23:00:35.162
815	/20200501033538-createCommentTables	2020-07-23 23:00:35.498
816	/20200617021631-AddUniqueConstraintInDataElementDataGroup	2020-07-23 23:00:35.98
817	/20200622025632-AddDataGroupsForAllSurveys	2020-07-23 23:00:37.449
818	/20200622025633-AddDataSourceIdColumn	2020-07-23 23:00:39.494
819	/20200622025634-RemoveDhis2InfoFromSurveyIntegrationMetadata	2020-07-23 23:00:39.805
820	/20200705042223-UpdateLaosSchoolsHandWashingFunctionalityMapOverlay	2020-07-23 23:00:40.11
821	/20200710031900-ChangDenominatorForSoughtMedicalAdviceFlutrackingOverlay-modifies-data	2020-07-23 23:00:40.165
822	/20200710065047-AddNewBinaryIndicatorTo5LaosSchoolsVisualisations-modifies-data	2020-07-23 23:00:40.519
823	/20200716001701-ChangeUnfpaStaffMatrixFacilityBaselineDate-modifies-data	2020-07-23 23:00:40.569
824	/20200625011337-AddUNFPARegionalLevelPercentageFacilitiesOfferingServicesDashboards	2020-07-28 22:33:32.881
825	/20200713235756-AddUnfpaRegionalLevelAtLest1StaffTrained-modifies-data	2020-07-28 22:33:33.259
826	/20200727002031-ChangeUNFPAProjectPermissionGroup-modifies-data	2020-07-28 22:33:33.291
827	/20200723044326-UpdateLaosSchoolsAccessToCleanWaterMapOverlay-modifies-data	2020-08-06 22:02:00.975
828	/20200724235329-MoveFrontEndMapOverlayInfoToPresentationOptionsColumn-modifies-data	2020-08-06 22:02:01.857
829	/20200724235629-DropFrontEndMapOverlayInfoColumns-modifies-schema	2020-08-06 22:02:02.07
830	/20200725050059-CreateMapOverlayGroupTables-modifies-schema	2020-08-06 22:02:02.225
831	/20200725050217-MigrateMapOverlayGroupData-modifies-data	2020-08-06 22:02:03.693
832	/20200725080640-DropMapOverlayGroupNameColumn-modifies-schema	2020-08-06 22:02:03.817
833	/20200726010801-CategoriseLaosSchoolsDropOutRatesMapOverlays-modifies-data	2020-08-06 22:02:04.263
834	/20200726031440-AddFluTrackingLandingPage-modifies-data	2020-08-06 22:02:04.3
835	/20200726083032-CategoriseLaosSchoolsRepetitionRatesMapOverlays-modifies-data	2020-08-06 22:02:04.61
836	/20200727071629-RemoveSchoolLevelBinaryIndicatorTable-modifies-data	2020-08-06 22:02:04.68
837	/20200804010531-ChangeStriveProjectDefaultMapOverlay-modifies-data	2020-08-06 22:02:04.721
838	/20200804021343-UpdateCOVIDAUProjectBackgroundUrl-modifies-data	2020-08-06 22:02:04.747
839	/20200617043305-AddWishCustomDataDownloadReport	2020-08-13 22:55:25.603
840	/20200623224901-RestrictWishRawDataDownloadAccess-modifies-data	2020-08-13 22:55:26.176
841	/20200710035752-AddUnfpaRawDataDownloadReproductiveHealthFacility-modifies-data	2020-08-13 22:55:26.379
842	/20200720095953-AddWishExportSurveyTestsByCode-modifies-data	2020-08-13 22:55:26.454
843	/20200723070535-AddLaosSchoolsPrimarySchoolLevelTextbookShortageByKeySubjectsAndGradesMatrix-modifies-data	2020-08-13 22:55:26.587
844	/20200726053205-AddLaosSchoolsLowerSecondarySchoolLevelTextbookShortageByKeySubjectsAndGradesMatrix-modifies-data	2020-08-13 22:55:26.84
845	/20200726053306-AddLaosSchoolsUpperSecondarySchoolLevelTextbookShortageByKeySubjectsAndGradesMatrix-modifies-data	2020-08-13 22:55:26.953
846	/20200727001331-AddLaosSchoolsPrimarySchoolLevelTextbookShortageBarGraph-modifies-data	2020-08-13 22:55:27.226
847	/20200727013315-AddLaosSchoolsLowerSecondarySchoolLevelTextbookShortageBarGraph-modifies-data	2020-08-13 22:55:27.579
848	/20200727013444-AddLaosSchoolsUpperSecondarySchoolLevelTextbookShortageBarGraph-modifies-data	2020-08-13 22:55:27.671
849	/20200730073820-AddLaosSchoolsMapOverlayPopulationDistrictAndProvinceLevel-modifies-data	2020-08-13 22:55:27.816
850	/20200803045941-AddUnfpaCountriesBackForSurveyRHFSC-modifies-data	2020-08-13 22:55:27.874
851	/20200803070231-AddLaosSchoolsFunctioningComputerOverlay-modifies-data	2020-08-13 22:55:28.004
852	/20200803233956-AddTongaHpuReportNutritionTotalSessionsConducted-modifies-data	2020-08-13 22:55:28.049
853	/20200804100254-AddReportTongaHpuHealthTalksSettingsTypePie-modifies-data	2020-08-13 22:55:28.126
854	/20200723055523-MigrateSpectrumScaleToNewFormat-modifies-data	2020-08-20 22:52:31.687
855	/20200723232942-FixFlutrackingOverlaysToHardLimitScale-modifies-data	2020-08-20 22:52:31.929
856	/20200729042609-AddLaosSchoolsTextbookToStudentRatioOverlay-modifies-data	2020-08-20 22:52:32.756
857	/20200803061954-RemoveLaosSchoolsStudentResourcesMapOverlays-modifies-data	2020-08-20 22:52:32.998
858	/20200803073517-AddNewLaosSchoolsElectricityAvailableOverlay-modifies-data	2020-08-20 22:52:33.19
859	/20200805072741-RemoveSomeLaosSchoolsSchoolIndicatorsEIEOverlays-modifies-data	2020-08-20 22:52:33.248
860	/20200805073136-UpdateLaosSchoolsOverlaysUsingSchCVD002-modifies-data	2020-08-20 22:52:33.301
861	/20200807115047-AddTongaHpuTobaccoWarningsFinesLocation-modifies-data	2020-08-20 22:52:33.427
862	/20200807061202-AddTotalScreenedForNCDRiskFactors-modifies-data	2020-08-27 22:13:12.29
863	/20200810005228-AddTongaHpuRateOfTobaccoNonComplianceDashboard-modifies-data	2020-08-27 22:13:12.399
864	/20200812034926-UpdateHP02NCDRiskFactorsScreeningEventsDashboard-modifies-data	2020-08-27 22:13:12.462
865	/20200814011117-FixUNFPAReportShowingOver100Percent-modifies-data	2020-08-27 22:13:12.724
935	/20201009061046-UpdateLaosEocEntities-modifies-data	2020-10-15 22:56:41.849
866	/20200814062713-DeprecateSpecificSumPerPeriodDatabuildersAndReplaceWithGeneric-modifies-data	2020-08-27 22:13:13.055
867	/20200817000740-AddTongaHpuReportNcdRiskFactorsByAgeAndGender-modifies-data	2020-08-27 22:13:13.183
868	/20200817045557-AddTongaHpuNumberOfInspectedAreasForTobaccoComplianceDashboard-modifies-data	2020-08-27 22:13:13.272
869	/20200817073430-ChangeFlutrackingOverlaysScaleBounds-modifies-data	2020-08-27 22:13:13.339
870	/20200820071030-FixIHRMapOverlaysMissingOrganisationUnitType-modifies-data	2020-08-27 22:13:13.404
871	/20200825113028-AddLaosEocProject-modifies-data	2020-08-27 22:13:13.673
872	/20200527025956-FixupsToMissingDataElementInPLSMDashboards	2020-09-03 23:25:54.617
873	/20200806062829-AddEmptyAndNoAccessDashboardReports-modifies-data	2020-09-03 23:25:55.75
874	/20200804082610-AddTongaHpuReportNutritionClientsByAgeGender-modifies-data	2020-09-10 22:49:47.74
875	/20200811090718-AddTongaHpuDashboardPieNumberNewQuitlineDistrict-modifies-data	2020-09-10 22:49:47.832
876	/20200831024802-UpdateUNFPAReportToAddFPData-modifies-data	2020-09-10 22:49:47.927
877	/20200903032810-AddStationProjectCodeAndProjectIdEntityTypes-modifies-schema	2020-09-10 22:49:54.539
878	/20200904032606-FixOldMeasureBuildersWithNewEntityAggregation-modifies-data	2020-09-10 22:49:54.79
879	/20200904053631-FixUnfpaRegionalTrainingData-modifies-data	2020-09-10 22:49:54.889
880	/20200909012517-AddParentToTongaPermissionGroup-modifies-data	2020-09-10 22:49:54.943
881	/20200805065956-DeleteSomeLaosSchoolsSchoolIndicatorsMapOverlays-modifies-data	2020-09-17 22:49:01.493
882	/20200805070112-CategoriseLaosSchoolsSchoolIndicatorsDistrictAndProvinceOverlays-modifies-data	2020-09-17 22:49:01.687
883	/20200805070208-AddOtherResponseToLaosSchoolsDevelopmentPartnerSupportOverlay-modifies-data	2020-09-17 22:49:01.945
884	/20200812043136-AddTongaHpuSettingTypeMapOverlay-modifies-data	2020-09-17 22:49:02.081
885	/20200828013343-AddMoreLaosSchoolsSchoolIndicatorsSubNationalLevelsMapOverlays-modifies-data	2020-09-17 22:49:02.558
886	/20200901150309-AddTongaHpuHealthTalksSettingTypeOverlay-modifies-data	2020-09-17 22:49:02.956
887	/20200901162829-AddTongaHpuPhysicalActivitySettingTypeOverlay-modifies-data	2020-09-17 22:49:03.14
888	/20200901175734-WishCustomSurveyExportSortByHouseholdId-modifies-data	2020-09-17 22:49:03.214
889	/20200910043451-AddCovidResultsToCD3bValidationReport-modifies-data	2020-09-17 22:49:03.269
890	/20200911061955-ClampLaosSchoolTextbookRatioOverlayScale-modifies-data	2020-09-17 22:49:03.335
891	/20200911065646-AddLaosSchoolsPolygonOverlaysStudentNumbers-modifies-data	2020-09-17 22:49:04.121
892	/20200921010041-FixLaosSchoolsSchoolIndicatorsEiESubNationalLevelsMapOverlaysEntityAggregation-modifies-data	2020-09-22 04:16:40.457
893	/20200720231712-AddIndicatorDataSourceType-modifies-schema	2020-09-25 00:25:59.955
894	/20200804033230-AddIndicatorTable-modifies-schema	2020-09-25 00:26:00.024
895	/20200826215112-UseAnalyticsPerPerPeriodBuilder-modifies-data	2020-09-25 00:26:00.186
896	/20200826215113-UseIndicatorsInStriveVisualisations-modifies-data	2020-09-25 00:26:01.41
897	/20200912130823-AddMoreLaosSchoolsSchoolIndicatorsEiEMapOverlays-modifies-data	2020-09-25 00:26:01.914
898	/20200914013333-UpdateLaosSchoolsSchoolIndicatorsEiEFunctioningTVMapOverlay-modifies-data	2020-09-25 00:26:02.098
899	/20200914013941-AddTextbookStudentRatioOverlaysDistrictAndProvinceLevel-modifies-data	2020-09-25 00:26:03.065
900	/20200914025424-UpdateLaosSchoolsSchoolIndicatorsEiEMapOverlaysWithMultipleValues-modifies-data	2020-09-25 00:26:03.314
901	/20200914043218-AddLaosSchoolsSchoolIndicatorsEiEDevelopmentPartnerSupportMapOverlayOtherResponse-modifies-data	2020-09-25 00:26:03.429
902	/20200914045259-RemoveSomeLaosSchoolsSchoolIndicatorsEiEMapOverlays-modifies-data	2020-09-25 00:26:03.502
903	/20200914080738-AddLaosSchoolsSchoolLevelICTFacilitiesDashboardReport-modifies-data	2020-09-25 00:26:03.564
904	/20200915040216-FixSamoaEntities-modifies-data	2020-09-25 00:26:04.348
905	/20200915054805-AddNcdReportsToCommunityHealthGroup-modifies-data	2020-09-25 00:26:04.413
906	/20200916061846-UpdateLaosSchoolsSchoolIndicatorsEiEFunctioningHandWashingFacilitiesMapOverlay-modifies-data	2020-09-25 00:26:04.475
907	/20200916082733-UpdateLaosSchoolsSchoolIndicatorsEiEUpdateAccessToWaterSupplyMapOverlay-modifies-data	2020-09-25 00:26:04.573
908	/20200920042029-AddLaosSchoolsPrePrimarySchoolLevelStudentNumbersTableDashboardReport-modifies-data	2020-09-25 00:26:04.611
909	/20200920055340-AddLaosSchoolsPrimarySchoolLevelStudentNumbersTableDashboardReport-modifies-data	2020-09-25 00:26:04.668
910	/20200920055441-AddLaosSchoolsSecondarySchoolLevelStudentNumbersTableDashboardReport-modifies-data	2020-09-25 00:26:04.722
911	/20200820022356-AddServiceTypeWeather-modifies-schema	2020-10-01 22:38:45.442
912	/20200910004911-AddWeatherDataElements-modifies-data	2020-10-01 22:38:46.733
913	/20200915004954-AddCovid19SchoolLevelReportLaos-modifies-data	2020-10-01 22:38:46.894
914	/20200916065711-AddWASHSchoolLevelReportLaos-modifies-data	2020-10-01 22:38:47.036
915	/20200917071431-AddTeachingAndLearningSchoolLevelDashboardLaos-modifies-data	2020-10-01 22:38:47.114
916	/20200925004629-AddSchoolDetailsTablesLaosSchools-modifies-data	2020-10-08 23:03:48.147
917	/20200926083458-CreateLaosSchoolsICTFacilitiesBarGraphDashboardReport-modifies-data	2020-10-08 23:03:48.303
918	/20200928022356-AddEntityTypeCity-modifies-schema	2020-10-08 23:03:52.994
919	/20200928061046-AddLaosEocEntities-modifies-data	2020-10-08 23:03:58.193
920	/20200928061654-CreateLaosSchoolsCOVID19BarGraphDashboardReport-modifies-data	2020-10-08 23:03:58.32
921	/20200928063927-CreateLaosSchoolsWASHBarGraphDashboardReport-modifies-data	2020-10-08 23:03:58.468
922	/20200928065206-CreateLaosSchoolsTeachingAndLearningBarGraphDashboardReport-modifies-data	2020-10-08 23:03:58.637
923	/20200910024211-CreateNewCovidDashboardSamoa-modifies-data	2020-10-15 22:56:34.161
924	/20200923065724-ConvertOverlaySortOrderToInteger-modifies-data	2020-10-15 22:56:34.266
925	/20200924001437-AddSortOrderToMapOverlayGroupRelationTable-modifies-schema	2020-10-15 22:56:34.317
926	/20200924001940-MigrateSortOrderDataFromMapOverlayTableToMapOverlayGroupRelationTable-modifies-data	2020-10-15 22:56:34.837
927	/20200924004521-DropSortOrderColumnFromMapOverlayTable-modifies-schema	2020-10-15 22:56:34.937
928	/20200924035244-DeleteOrphanMapOverlayRelations-modifies-data	2020-10-15 22:56:34.987
929	/20200925011104-CreateRootMapOverlay-modifies-data	2020-10-15 22:56:35.026
930	/20200925012948-ConnectTopLevelMapOverlayGroupsToWorldMapOverlayGroup-modifies-data	2020-10-15 22:56:35.176
931	/20200925051137-ReorderLaosSchoolsSchoolIndicatorsMapOverlays-modifies-data	2020-10-15 22:56:35.414
932	/20200925064855-ReorderLaosSchoolsOverlayGroups-modifies-data	2020-10-15 22:56:35.512
933	/20200929223403-AddTileSetsToProject-modifies-schema	2020-10-15 22:56:35.556
934	/20201002022840-AddProfileImageToUserAccount-modifies-schema	2020-10-15 22:56:35.594
936	/20201015015257-DeleteAnswerWith9998-modifies-data	2020-10-15 22:56:42.781
937	/20201019011335-RemoveRedundantDataInFijiEntity-modifies-data	2020-10-22 21:05:09.326
938	/20201026223059-UpdateLinkOnFeedItems-modifies-data	2020-10-29 21:35:21.235
939	/20200925020630-AddStackedBarGraphsBySchoolTypeLaosSchools-modifies-data	2020-11-06 00:18:41.417
940	/20200930141002-AddLaosSchoolsNumberOfSchoolsSupportedByDevelopmentPartnersDashboardReport-modifies-data	2020-11-06 00:18:41.935
941	/20201002053523-AddDistrictDetailsTablesLaosSchools-modifies-data	2020-11-06 00:18:42.139
942	/20201005040334-AddProvinceAndNationalDetailsTablesLaosSchools-modifies-data	2020-11-06 00:18:42.27
943	/20201008065400-AddLaosSchoolsNumberOfStudentsMatrix-modifies-data	2020-11-06 00:18:42.337
944	/20201021060652-AddAttributesColumnIntoOptionTable-modifies-schema	2020-11-06 00:18:42.494
945	/20201103092344-AddPSSSProject-modifies-data	2020-11-06 00:18:42.916
946	/20200824014037-CreateEntityHierarchyCache-modifies-schema	2020-11-13 00:26:44.1
947	/20201002193222-AddEntityParentIdIndex-modifies-schema	2020-11-13 00:26:44.561
948	/20201006211507-BuildAncestorDescendantRelationCache-modifies-data	2020-11-13 00:27:45.26
949	/20201008205444-IncludeOldRecordInChangeNotifications-modifies-schema	2020-11-13 00:27:45.304
950	/20201009035426-AddImmutableTableTrigger-modifies-schema	2020-11-13 00:27:45.324
951	/20201026232410-DeleteEntityPublicHealthService-modifies-data	2020-11-13 00:27:46.03
952	/20201105014950-AddEntityTypesToHierarchy-modifies-schema	2020-11-13 00:27:46.077
953	/20201105015339-AddCasesAsCanonicalInSomeHierarchies-modifies-data	2020-11-13 00:27:46.098
954	/20201110210258-AddFijiDistrictsToEntityRelation-modifies-data	2020-11-13 00:27:46.161
955	/20201006024935-AddLaosSchoolsTextbookStudentRatioBarGraph-modifies-data	2020-11-19 23:41:00.749
956	/20201110234830-DeleteOldLaosSchoolsTextbookData-modifies-data	2020-11-19 23:41:09.874
957	/20201116002004-ChangeUNFPADefaultMeasure-modifies-data	2020-11-19 23:41:09.903
958	/20201117025041-DeleteTestDistrictEntity-modifies-data	2020-11-19 23:41:10.278
959	/20201008010413-AddLaosEocHistoricMapOverlays-modifies-data	2020-11-27 00:20:09.645
960	/20201009010413-AddLaosEocForecastMapOverlays-modifies-data	2020-11-27 00:20:09.986
961	/20201012010424-AddLaosEocWeatherDashboards-modifies-data	2020-11-27 00:20:10.128
962	/20201014220808-AddLaosEocAggregateForecastMapOverlays-modifies-data	2020-11-27 00:20:10.254
963	/20201028234713-AddReportsTable-modifies-schema	2020-11-27 00:20:10.322
964	/20201104032225-AddDashboardGroupForMS1Administration-modifies-data	2020-11-27 00:20:10.383
965	/20201123002611-AddNZToPSSSProject-modifies-data	2020-11-27 00:20:10.46
966	/20201123061122-AddConfirmedWeeklyDataReportForPSSS-modifies-data	2020-11-27 00:20:10.503
967	/20201124054820-AddPsssSessionTable-modifies-schema	2020-11-27 00:20:10.523
968	/20201117053359-AddPsssWoWIncreaseIndicators-modifies-data	2020-12-04 01:26:07.217
969	/20201118022314-ChangePeriodGraularityInUnfpaPriorityMedicinesMatrixDashboardReport-modifies-data	2020-12-04 01:26:07.743
970	/20201118220905-ReorderRowsToMosAmcSohTablesForUnfpa-modifies-data	2020-12-04 01:26:08.149
971	/20201125021221-AddPsssAlertThresholdIndicators-modifies-data	2020-12-04 01:26:09.126
972	/20201125204230-removeToDeliveryServiceStockReport-modifies-data	2020-12-04 01:26:09.32
973	/20201126060032-AddUnconfirmedWeeklyDataReportForPSSS-modifies-data	2020-12-04 01:26:09.581
974	/20201129051349-DropPSSSSessionNotifyChangesTrigger-modifies-schema	2020-12-04 01:26:09.631
975	/20201201022321-AddPSSSTotalSitesIndicator-modifies-data	2020-12-04 01:26:09.866
976	/20201201033216-AddProjectCovid19Samoa-modifies-data	2020-12-04 01:26:10.165
977	/20201111013312-RemoveItemsFromLineChartsInUnfpaDashboard-modifies-data	2020-12-11 02:55:22.949
978	/20201116013159-AddMinMaxValuestoMOSReport-modifies-data	2020-12-11 02:55:22.998
979	/20201116024506-RemoveMapOverlayUNFPA-modifies-data	2020-12-11 02:55:23.088
980	/20201120051651-RemoveItemsFromMapOverLayGroupsRelationInUnfpa-modifies-data	2020-12-11 02:55:23.289
981	/20201120051938-DeleteItemsInUnfpaStockMosByPercentCountries-modifies-data	2020-12-11 02:55:23.402
982	/20201120052316-DeleteItemsFromUnfpaPriorityMedicinesTable-modifies-data	2020-12-11 02:55:23.596
983	/20201208010502-AddPSSSWeekyCasesReport-modifies-data	2020-12-11 02:55:23.703
984	/20201208234222-SplitLaosSchoolsDashboardGroups-modifies-data	2020-12-11 02:55:23.929
985	/20201209001056-ChangePSSSReportsToUseLastPerPeriodPerOrgUnit-modifies-data	2020-12-11 02:55:23.997
986	/20201209052048-EditWoWIndicatorsToGiveRelativeIncrease-modifies-data	2020-12-11 02:55:24.067
987	/20201209232802-EditSiteAverageIndicatorsToSupportDivByZero-modifies-data	2020-12-11 02:55:24.397
988	/20201213223856-AddCanonicalTypesToSamoaCovid-modifies-data	2020-12-17 02:16:55.857
989	/20201214000845-ChangeDotMatrixViewSchema-modifies-data	2020-12-17 02:16:56.08
990	/20201214000945-AddLegendsToUNFPAMatricies-modifies-data	2020-12-17 02:16:56.19
991	/20201215080555-UpdateFormulaAndDefaultValuesForPreviousWeeksToAlertThresholdLevelIndicators-modifies-data	2020-12-17 02:16:56.27
992	/20201126030925-AddPngRawDataDownloadSurveyPermissions-modifies-data	2021-01-07 23:09:19.224
993	/20201201082830-AddProjectPalauOlangch-modifies-data	2021-01-07 23:09:19.466
994	/20201208103439-AddPalauEntities-modifies-data	2021-01-07 23:09:20.319
995	/20201213223857-AddTotalRepatriatedPassengersCovid19ReportSoamoa-modifies-data	2021-01-07 23:09:20.421
996	/20201214092416-LaosSchoolsAddMoesGroup-modifies-data	2021-01-07 23:09:20.445
997	/20210105024922-AddDateSeletorHpu-modifies-data	2021-01-07 23:09:20.603
998	/20210107010710-AddPgToDiaSurveyCountryIds-modifies-data	2021-01-07 23:09:20.674
999	/20210107015502-SamoaUseBcdsSurveyForRawDataDownload-modifies-data	2021-01-07 23:09:20.71
1000	/20201216050328-AddCovidSamoaAgeByFlightMatrix-modifies-data	2021-01-14 22:37:18.017
1001	/20201220233030-ConvertAlertsToSurveyResponses-modifies-schema	2021-01-14 22:37:18.092
1002	/20210120051444-ResyncSubmissionsAfterRelease70-modifies-data	2021-01-21 04:35:14.832
1003	/20210106000258-HeatmapOfVillageConfirmedAndSuspectedCases-modifies-data	2021-01-21 21:32:43.153
1004	/20210110220114-AddCovidSamoaDemoIndivQuarhealthCond-modifies-data	2021-01-21 21:32:43.253
1005	/20210114103503-AddCovidSamoaDemoIndivQuarSex-modifies-data	2021-01-21 21:32:43.315
1006	/20210114125216-AddCovidSamoaClearanceDocuments-modifies-data	2021-01-21 21:32:43.368
1007	/20210118014114-CreateIndividualEntityType-modifies-schema	2021-01-21 21:32:45.157
1008	/20210118040638-AddFetpProject-modifies-data	2021-01-21 21:32:45.3
1009	/20210125010541-ResyncDelayedSubmissionsAfterRelease70-modifies-data	2021-01-27 05:47:35.825
1010	/20201117224102-DeleteUNFPAStaffTrainedLines-modifies-data	2021-01-28 22:30:09.496
1011	/20201117224832-AddUNFPAStaffTrainedMatrix-modifies-data	2021-01-28 22:30:09.568
1012	/20201123014943-IntegrateInconsistentAnswersForHotelNames-modifies-data	2021-01-28 22:30:10.729
1013	/20201204224102-DeleteUNFPAStaffTrainedLinesCountry-modifies-data	2021-01-28 22:30:10.823
1014	/20201204224832-AddUNFPAStaffTrainedMatrixCountry-modifies-data	2021-01-28 22:30:11.098
1015	/20210114131303-AddCovidSamoaQuarantineSiteByFlight-modifies-data	2021-01-28 22:30:11.186
1016	/20210121213045-MigrateStriveCanonicalToAlternateHeirarchy-modifies-data	2021-01-28 22:30:11.443
1017	/20210125033426-MigrateFijiSurveyDataElementsFromDHISToTupaia-modifies-data	2021-01-28 22:30:11.923
1018	/20210107004358-AddSwapColorForLegendInLaoSchool-modifies-data	2021-02-04 22:20:14.056
1019	/20210125051145-AddGeneralDashboardToPalau-modifies-data	2021-02-04 22:20:14.143
1020	/20210125061447-AddK13PCRResultsBarGraph-modifies-data	2021-02-04 22:20:14.247
1021	/20210126013657-AddK13C580YPositiveMapOverlay-modifies-data	2021-02-04 22:20:14.457
1022	/20210129022440-AddFacilityTypeOverlayForFiji-modifies-data	2021-02-04 22:20:14.611
1023	/20210201230429-MoveServiceTypeOverlayGroupToTheTop-modifies-data	2021-02-04 22:20:14.686
1024	/20210125025423-ChangePermissionInSamoaToCovid19Senior-modifies-data	2021-02-12 00:34:03.53
1025	/20210125042225-SamoaCovidSurveyHierarchyUpdate-modifies-data	2021-02-12 00:34:07.715
1026	/20210126234710-HeatmapHomeVillageOfQuarantinePassengers-modifies-data	2021-02-12 00:34:07.932
1027	/20210127010108-AddMissingDataElements-modifies-data	2021-02-12 00:34:45.786
1028	/20210127064624-MedicalCertificateLegendColorChange-modifies-data	2021-02-12 00:34:46.507
1029	/20210128033137-AddSurveyDateElementsForDhisSurveys-modifies-data	2021-02-12 00:34:56.045
1030	/20210128033138-AddPreaggregatedDataElements-modifies-data	2021-02-12 00:34:56.843
1031	/20210128033139-AddMissingDataElementDataGroups-modifies-data	2021-02-12 00:35:24.249
1032	/20210201040026-AddDataSourceIdNotNullConstraints-modifies-schema	2021-02-12 00:35:24.489
1033	/20210202053553-AddIndividualToFetpCanonicalTypes-modifies-data	2021-02-12 00:35:24.623
1034	/20210202204715-AddPalauDashboardGroupSupplyChain-modifies-data	2021-02-12 00:35:24.687
1035	/20210209030539-AddMissingDataGroups-modifies-data	2021-02-12 00:35:24.947
1036	/20210119053017-SomoaCovidCustomisedRawDataDownload-modifies-data	2021-02-18 22:21:40.842
1037	/20210202061216-AddFetpGraduateIndividualProfiles-modifies-data	2021-02-18 22:21:40.991
1038	/20210204025332-CreateFetpDashboardGroupsForProvDistrict-modifies-data	2021-02-18 22:21:41.08
1039	/20210204211247-AddFetpDashboardGraduatesBySex-modifies-data	2021-02-18 22:21:41.123
1040	/20210207040642-AddFETPActiveGraduatesMapOverlays-modifies-data	2021-02-18 22:21:41.308
1041	/20210208025858-RemoveSurveyFromRawDataDownload-modifies-data	2021-02-18 22:21:41.372
1042	/20210209005053-RenameCaseEntityToIndividualEntity-modifies-data	2021-02-18 22:21:42.216
1043	/20210209044534-MapOverlayAndDashboardToSupportIndividualFromCase-modifies-data	2021-02-18 22:21:42.596
1044	/20210210031149-SamoaRawDataDownloadDashboardGroup-modifies-data	2021-02-18 22:21:42.793
1045	/20210211025858-UpdateFETPGraduateProfileReports-modifies-data	2021-02-18 22:21:42.916
1046	/20210123065802-MigrateRadioQuestionsToBinaryQuestionsInLaosSchools-modifies-data	2021-02-25 23:10:49.214
1047	/20210123071051-MigrateLaosSchoolsDashboardsBinaryDataToZeroOne-modifies-data	2021-02-25 23:10:49.343
1048	/20210123120226-MigrateLaosSchoolsMapOverlaysBinaryDataToZeroOne-modifies-data	2021-02-25 23:10:49.81
1049	/20210124013906-FixLaosSchoolsDevelopmentPartnerSupportMapOverlay-modifies-data	2021-02-25 23:10:49.911
1050	/20210124014513-UpdateLaosSchoolsDevPartnersMapOverlays-modifies-data	2021-02-25 23:10:50.003
1051	/20210124020024-UpdateLaosSchoolsSpecialMapOverlays-modifies-data	2021-02-25 23:10:50.269
1052	/20210124055714-ConvertDhisSurveysIntoTupaia-modifies-data	2021-02-25 23:10:51.767
1053	/20210124063304-ConvertSurveyRawDataDownloadToCustomDataDownload-modifies-data	2021-02-25 23:10:51.858
1054	/20210124073946-FixUNFPAPercentagesOfFacilitiesOfferingServicesReports-modifies-data	2021-02-25 23:10:52.071
1055	/20210124115954-FixUNFPAContraceptivesOfferedReport-modifies-data	2021-02-25 23:10:52.164
1056	/20210128102520-PalauFacilityOpeningHoursDashboard-modifies-data	2021-02-25 23:10:52.297
1057	/20210202031622-NutritionCounsellingTotalNewAndExistingClients-modifies-data	2021-02-25 23:10:52.508
1058	/20210205033535-AddSTRIVEMolecularDataOverlays-modifies-data	2021-02-25 23:10:52.708
1059	/20210216014736-UpdateCountryCodeForIndividuals-modifies-data	2021-02-25 23:10:52.88
1060	/20210216073210-AddFetpDashboardGradByDistrict-modifies-data	2021-02-25 23:10:53.005
1061	/20210217053158-ChangeElementsServiceTypeToTupaia-modifies-data	2021-02-25 23:10:53.098
1062	/20210224014424-AddConfigToProjects-modifies-schema	2021-02-25 23:10:53.351
1063	/20201203010928-StockStatusForNonMsupplyContriesInFacilityLevel-modifies-data	2021-03-04 23:27:55.547
1064	/20210211051517-RenameArithmeticIndicators-modifies-data	2021-03-04 23:27:55.651
1065	/20210216015237-AddWeatherSourceToDashboardTitle-modifies-data	2021-03-04 23:27:56.037
1066	/20210223002537-AddReferenceToMapOverlays-modifies-data	2021-03-04 23:27:56.374
1067	/20210225033329-RemoveLaosOxygenConcentratorsProject-modifies-data	2021-03-04 23:28:06.076
1068	/20210301123426-AddFetpDashboardsToSolomonIs-modifies-data	2021-03-04 23:28:06.27
1069	/20210303020040-removeStriveMapOverlaysFromExplore-modifies-data	2021-03-04 23:28:06.321
1070	/20210129024523-AddAyfsToStaffTrainedVisuals-modifies-data	2021-03-11 21:42:33.922
1071	/20210202190359-ConvertRHS2UNFPA240ToBinaryQuestion-modifies-data	2021-03-11 21:42:39.357
1072	/20210210011723-UpdateMedicinesAndConsumablesOverlaysFiji-modifies-data	2021-03-11 21:42:41.332
1073	/20210214234630-AddDataDownloadNationalFETP-modifies-data	2021-03-11 21:42:41.566
1074	/20210224210744-AddLesmisSessionTable-modifies-schema	2021-03-11 21:42:41.63
1075	/20210302015338-FlipLegendColorFetpMapOverlay-modifies-data	2021-03-11 21:42:41.879
1076	/20210304060352-UpdatePSSSWeeklyCasesIndicatorsSupportDailyData-modifies-data	2021-03-11 21:42:41.999
1077	/20210311002222-AddDefaultValueForDailyCasesInPSSSWeeklyIndicators-modifies-data	2021-03-11 21:42:42.18
1078	/20210121045801-AddTableDataServiceEntity-modifies-schema	2021-03-16 02:28:29.871
1079	/20210201051217-SyncLaosEocEntitiesWithLaosSchools-modifies-data	2021-03-16 02:28:30.449
1080	/20210205000427-AddLaosEocPocDashboard-modifies-data	2021-03-16 02:28:30.703
1081	/20210205040848-AddLaosEocPocMapOverlayDengueCasesByWeek-modifies-data	2021-03-16 02:28:30.96
1082	/20210208023411-RefactorLaosEocPocDataBuilder-modifies-data	2021-03-16 02:28:31.098
1083	/20210211041322-AddSubFacilityEntityType-modifies-schema	2021-03-16 02:28:33.266
1084	/20210212033659-AddMissingLaosGeographicalAreas-modifies-data	2021-03-16 02:28:35.158
1085	/20210215023211-FixLaosEntityHierarchy-modifies-data	2021-03-16 02:28:35.346
1341	/20210705232632-AddECEGoalsDrillDowns-modifies-data	2021-08-27 01:20:23.562
1086	/20210222124639-UpdateLaosEntitiesPushMetadata-modifies-data	2021-03-16 02:28:41.483
1087	/20210222204800-UpdateEntityDhisIdToTrackEntityInstanceId-modifies-data	2021-03-16 02:28:45.189
1088	/20210316013933-DeleteFijiEntities-modifies-data	2021-03-16 03:31:53.903
1089	/20210305010124-AddMissingCasesToSyncQueue-modifies-data	2021-03-18 22:18:05.679
1090	/20210309020032-MalariaMapOverlaysLaosEOC-modifies-data	2021-03-18 22:18:05.957
1091	/20210309230008-MalariaDataSourceLaosEOC-modifies-data	2021-03-18 22:18:06.121
1092	/20210310053755-DengueMapOverlaysLaosEOC-modifies-data	2021-03-18 22:18:06.329
1093	/20210310053808-DengueDataSourceLaosEOC-modifies-data	2021-03-18 22:18:06.461
1094	/20210311045832-AddLaosEOCMapOverlayGroup-modifies-data	2021-03-18 22:18:06.492
1095	/20210312023820-AddMalariaCommoditiesIndicatorDataSources-modifies-data	2021-03-18 22:18:06.596
1096	/20210312023908-AddLaosEOCMalariaDashboardGroups-modifies-data	2021-03-18 22:18:06.644
1097	/20210312031441-AddLaosEOCMalariaCommoditiesTrafficLightTableDistrictLevel-modifies-data	2021-03-18 22:18:06.699
1098	/20210312044245-AddLaosEOCMalariaCommoditiesTrafficLightTableFacilityLevel-modifies-data	2021-03-18 22:18:06.758
1099	/20210312113926-AddLaosEOCMalariaStockAvailabilityByFacilityOverlay-modifies-data	2021-03-18 22:18:07.016
1100	/20210312214059-UpdateLaosSchoolsFunctioningTVSateliteOverlayConfig-modifies-data	2021-03-18 22:18:07.119
1101	/20210312385124-AddLaosEocMapOverlayMeaslesVaccineStockByFacility-modifies-data	2021-03-18 22:18:07.187
1102	/20210314024746-AddLaosEOCMalariaCriticalItemAvailabilityOverTimeDashboard-modifies-data	2021-03-18 22:18:07.239
1103	/20210314054551-AddLaosEOCMalariaCriticalItemAvailabilitySingleViewDashboard-modifies-data	2021-03-18 22:18:07.299
1104	/20210315001552-AddDataSourceMeaslesDeathCasesLaosEOC-modifies-data	2021-03-18 22:18:07.401
1105	/20210315001650-AddMapOverlayMeaslesDeathCasesLaosEOC-modifies-data	2021-03-18 22:18:07.521
1106	/20210315092702-UpdateLaosEOCMapOverlayMeasureBuilder-modifies-data	2021-03-18 22:18:07.814
1107	/20210317015957-HideNoDataInBubbleMapLaoEoc-modifies-data	2021-03-18 22:18:07.921
1108	/20210317052741-MoveLonelyMapOverlay-modifies-data	2021-03-18 22:18:07.976
1109	/20210317053313-UpdateLaosEOCMalariaStockAvailabilityByFacilityOverlay-modifies-data	2021-03-18 22:18:08.123
1110	/20210317054627-AddDateSelectorForMeaslesVaccineStockAvailabilityByFacilityOverlay-modifies-data	2021-03-18 22:18:08.206
1111	/20210323045613-LaosEocRemoveUnpermittedFacilities-modifies-data	2021-03-23 23:36:29.462
1112	/20201201055113-AddCustomExportsDashboardGovernmentSurveysWishFiji-modifies-data	2021-04-01 00:46:42.177
1113	/20201208073839-WishFijiGovSurveysAssociateToCatchments-modifies-data	2021-04-01 00:46:42.535
1114	/20210112015125-AddHeatmapContactsConfirmedSuspectedCasesSCovidSamoa-modifies-data	2021-04-01 00:46:42.702
1115	/20210219055420-SamoaHeatmapHomeVillageOfConfirmedCases-modifies-data	2021-04-01 00:46:42.899
1116	/20210220030550-AddTongaHPUProvincialLevelDashboardGroup-modifies-data	2021-04-01 00:46:43.087
1117	/20210220141021-AddTongaHPURateOfAtRiskNCDRiskFactorsInScreenedPopulationDashboard-modifies-data	2021-04-01 00:46:43.422
1118	/20210324041508-AddSupplyChainFijiProject-modifies-data	2021-04-01 00:46:43.798
1119	/20210324075314-AddEhealthNauruProject-modifies-data	2021-04-01 00:46:44.118
1120	/20210325001804-AddCovidVaccineTrackingDashboardGroups-modifies-data	2021-04-01 00:46:44.194
1121	/20210325014751-ChangeSupplyChainProjectBackgroundImage-modifies-data	2021-04-01 00:46:44.241
1122	/20210325030144-VaccineDoseTakenByDayVaccineTracking-modifies-data	2021-04-01 00:46:44.699
1123	/20210325041744-AddCovidVaccinatedBySex-modifies-data	2021-04-01 00:46:44.838
1124	/20210325123857-ExcludeIndividualsFromCovidSamoaFront-modifies-data	2021-04-01 00:46:44.901
1125	/20210328230816-AddCovidVaccinatedBySexDistrict-modifies-data	2021-04-01 00:46:44.988
1126	/20210329001149-AddCovidVaxTrackingHomeVillageDose2-modifies-data	2021-04-01 00:46:45.082
1127	/20210329022054-AddCovidVaxTrackingVillageDose1-modifies-data	2021-04-01 00:46:45.167
1128	/20210329224807-AddCovidVaccineTotalDashboards-modifies-data	2021-04-01 00:46:45.454
1129	/20210204040357-AddDataTimeToSurveyResponses-modifies-schema	2021-04-09 00:39:10.714
1130	/20210204201652-CalculateDataTime-modifies-data	2021-04-09 00:39:22.656
1131	/20210225030219-DeleteSubmissionTimeFromSurveyResponses-modifies-schema	2021-04-09 00:39:22.727
1132	/20210319015928-UpdateDataSourceConstraintsOnQuestions-modifies-schema	2021-04-09 00:39:22.823
1133	/20210317035935-AddConfigForCategoryHeadingLaosEoc-modifies-data	2021-04-15 23:20:40.678
1134	/20210329230317-UpdateLaosSchoolsToPublic-modifies-data	2021-04-15 23:20:40.854
1135	/20210303025836-AddFETPGradAreaOfExpertiseOverlays-modifies-data	2021-04-23 01:17:33.337
1136	/20210310032310-UpdateLaosEOCWeatherDashboards-modifies-data	2021-04-23 01:17:33.465
1137	/20210318031303-UseTupaiaServiceInStrive-modifies-data	2021-04-23 01:17:51.541
1138	/20210322030033-FixStriveAfterTupaiaServiceConversion-modifies-data	2021-04-23 01:17:53.814
1139	/20210323030105-LaosEocShadowedTileSets-modifies-data	2021-04-23 01:17:53.86
1140	/20210412055533-LaosEocEntitycleanUp-modifies-data	2021-04-23 01:17:54.228
1141	/20210415033728-AddParentToFijiDataCollection-modifies-data	2021-04-23 01:17:54.412
1142	/20210416015517-FixStriveWtfOverlays-modifies-data	2021-04-23 01:17:54.664
1143	/20210413234307-AddExploreOverlayToCovidSamoaProjecctt-modifies-data	2021-04-29 22:32:02.804
1144	/20210415073206-ConvertSingleColumnTableTO-CHDashboardReportsToTableOfDataValuesCH11-CH4-modifies-data	2021-04-29 22:32:02.936
1145	/20210415073207-AddDashboardGroupCommunityHealthCountryFanafana-modifies-data	2021-04-29 22:32:03.071
1146	/20210428030104-DeleteSamoaCovidDashboardGroupFromExplore-modifies-data	2021-04-29 22:32:03.097
1147	/20210412210749-AddLesmisEntityVitalsReports-modifies-data	2021-05-06 22:31:11.829
1148	/20210414015925-UpdateLaosEOCIndicatorDataSources-modifies-data	2021-05-06 22:31:11.991
1149	/20210420001619-RemoveMugilFromStrive-modifies-data	2021-05-06 22:31:12.512
1150	/20210430035254-ChangeLaosSchoolsPermissionToLESMISPublic-modifies-data	2021-05-06 22:31:12.682
1151	/20210502231014-RemoveHealthFacilitiesLaosSchoolsHierarchy-modifies-data	2021-05-06 22:31:12.731
1152	/20210503020203-RenameDashboardHeadings-modifies-data	2021-05-06 22:31:13.149
1153	/20210503020225-LESMISReportsNewPermissionGroup-modifies-data	2021-05-06 22:31:13.278
1154	/20210413033910-UpdateSTRIVEK13MapOverlay-modifies-data	2021-05-14 00:20:03.739
1155	/20210422030246-CreateUnknownEntitiesForSamoa-modifies-data	2021-05-14 00:20:04.022
1156	/20210505101731-AddSamoaCovidPercentageDashboards-modifies-data	2021-05-14 00:20:04.117
1157	/20210506052033-AddSamoaCovidPercentageVaccinatedMeasures-modifies-data	2021-05-14 00:20:04.203
1158	/20210507014219-PutWaiviviaToTheRightPlace-modifies-data	2021-05-14 00:20:04.303
1159	/20210512224458-LaEocLaRemoveDeletedFacility-modifies-data	2021-05-14 05:33:47.267
1160	/20210407005547-AddParentRelationForSubFacility-modifies-data	2021-05-21 04:35:07.41
1161	/20210407020951-ChangeDataSourceEntityTypeOfLaosEocMapOverlays-modifies-data	2021-05-21 04:35:07.529
1162	/20210408055640-ChangeDataSourceEntityTypeOfLaosEocDashboardReports-modifies-data	2021-05-21 04:35:07.632
1163	/20210426232045-AddStriveFacilityEpiCurveDashboard-modifies-data	2021-05-21 04:35:07.675
1164	/20210503035005-TotalPassagerByAgeAndGenderGraphChart-modifies-data	2021-05-21 04:35:07.759
1165	/20210505230824-ConvidSamoaNumOfPassengersDashboard-modifies-data	2021-05-21 04:35:07.795
1166	/20210520020331-AddAccessTokenExpiryFieldToTupaiaUserSessionTable-modifies-schema	2021-05-27 22:25:41.851
1167	/20210521022725-DataSourceCodeCleanUpLaosEoc-modifies-data	2021-05-27 22:25:42.131
1168	/20210312284218-AddLaosEocMeaslesMapOverlayGroup-modifies-data	2021-06-03 23:21:04.999
1169	/20210316215800-AddLaosEocMeaslesCommoditiesDataSources-modifies-data	2021-06-03 23:21:05.057
1170	/20210316222124-AddLoasEocMeaslesDashboardGroups-modifies-data	2021-06-03 23:21:05.108
1171	/20210316222937-AddLaosEocMeaslesCammoditiesTrafficLightDashboards-modifies-data	2021-06-03 23:21:05.191
1172	/20210409060829-AddPsssTupaiaPermission-modifies-data	2021-06-03 23:21:05.223
1173	/20210409063837-AddPsssNumOfSentinelSitesDashboard-modifies-data	2021-06-03 23:21:05.436
1174	/20210413001758-AddPsssVisCountryLevelDashboard2y-modifies-data	2021-06-03 23:21:05.672
1175	/20210413043020-AddPsssCountryTrendDashboards-modifies-data	2021-06-03 23:21:05.871
1176	/20210414064856-AddSyndromicSurveillanceNationalDashboardGroup-modifies-data	2021-06-03 23:21:05.901
1177	/20210414064857-DailyCasesTrendGraphPalauCountryLevel-modifies-data	2021-06-03 23:21:05.964
1178	/20210415051039-UpdateLaosEocMeaslesCommoditiesTableCategoryHeadings-modifies-data	2021-06-03 23:21:06.07
1179	/20210415110921-UpdatePSSSWeeklyIndicatorsSupportSiteData-modifies-data	2021-06-03 23:21:06.138
1180	/20210416052750-DailyCasesTrendGrahphPalauFacilityLevel-modifies-data	2021-06-03 23:21:06.239
1181	/20210419221219-AddLaEocMeaslesCriticleItemAvailReport-modifies-data	2021-06-03 23:21:06.302
1182	/20210419221250-AddLaEocMeaslesCriticalItemsAvailCurrentReport-modifies-data	2021-06-03 23:21:06.382
1183	/20210419225536-UpdatePSSSTotalSitesReportToUseSiteData-modifies-data	2021-06-03 23:21:06.558
1184	/20210420031825-WeeklyCasesTrendGraphForPalauCountry-modifies-data	2021-06-03 23:21:06.641
1185	/20210420031826-WeeklyCasesTrendGraphForPalauFacility-modifies-data	2021-06-03 23:21:06.718
1186	/20210421001607-PsssPalauSyndromBubbleMapOverlay-modifies-data	2021-06-03 23:21:06.88
1187	/20210422032557-AddPsssConTotalCasesIndicator-modifies-data	2021-06-03 23:21:06.919
1188	/20210426204745-AddLaEocDengueCaseBarDistrict-modifies-data	2021-06-03 23:21:06.951
1189	/20210503024117-AddLaEocMapOverlayDengueCasesByWeekDistrict-modifies-data	2021-06-03 23:21:06.991
1190	/20210503055037-AddLaEocMapOverlayMalariaCasesByWeek-modifies-data	2021-06-03 23:21:07.036
1191	/20210503082425-AddLaEocMalariaCasesBarChart-modifies-data	2021-06-03 23:21:07.077
1192	/20210504040112-AddPsssCountryTrendDashboardsPastYears-modifies-data	2021-06-03 23:21:07.178
1193	/20210510061852-AddPSSSActiveAlertsReport-modifies-data	2021-06-03 23:21:07.22
1194	/20210511024953-LaEocUpdateCamoditityTablePresentationOptions-modifies-data	2021-06-03 23:21:07.295
1195	/20210511050324-AddPSSSArchivedAlertsReport-modifies-data	2021-06-03 23:21:07.356
1196	/20210512004319-AddPSSSConfirmedDataPerSyndromeReport-modifies-data	2021-06-03 23:21:07.417
1197	/20210512114642-UpdatePSSSTotalSitesReportedIndicator-modifies-data	2021-06-03 23:21:07.451
1198	/20210512115557-AddPSSSWeeklyDataPerSyndromeReports-modifies-data	2021-06-03 23:21:07.519
1199	/20210512234422-LaEocAddMalariaProvinceDashboardGroup-modifies-data	2021-06-03 23:21:07.542
1200	/20210513065305-AddPSSSConfirmedWeeklyDataPerSyndromeReports-modifies-data	2021-06-03 23:21:07.608
1201	/20210519235606-LaEocAddDengueCommoditiesTrafficLight-modifies-data	2021-06-03 23:21:07.677
1202	/20210520024548-LaEocAddSubDistrictDataSources-modifies-data	2021-06-03 23:21:07.776
1203	/20210520051328-LaEocUpdateDengueWeeklyByDistrictConfig-modifies-data	2021-06-03 23:21:07.792
1204	/20210525072702-UpdatePSSSSyndromeThresholdCrossedIndicators-modifies-data	2021-06-03 23:21:07.852
1205	/20210604004448-CovidSamoaVaccineDeleteResponses-modifies-data	2021-06-04 03:33:38.122
1206	/20210602041852-Rename-lesmis-permission-groups-modifies-data	2021-06-11 00:51:27.905
1207	/20210607063222-RewritePSSSIndicatorsToUseRelativesEntityAggregation-modifies-data	2021-06-11 00:51:28.032
1208	/20210601081726-AddStriveObservedReplicateMortalityBarChart-modifies-data	2021-06-18 04:28:11.431
1209	/20210602005249-AddStriveVectorOverlayGroup-modifies-data	2021-06-18 04:28:11.473
1210	/20210602005250-AddStriveResistanceOverlay-modifies-data	2021-06-18 04:28:11.528
1211	/20210602030419-AddFijiCOVIDVaccinatedMapOverlayGroup-modifies-data	2021-06-18 04:28:11.576
1212	/20210602030420-AddFijiCOVIDVaccinatedByFacilityOverlays-modifies-data	2021-06-18 04:28:11.638
1213	/20210602065620-AddFijiCOVIDVaccinatedRegionOverlays-modifies-data	2021-06-18 04:28:11.702
1214	/20210603022946-AddFijiSupplyChainHeirarchySubDistricts-modifies-data	2021-06-18 04:28:11.715
1215	/20210603023401-AddFijiCOVIDVaccinePercentageOfPopulationVaccinatedMapOverlays-modifies-data	2021-06-18 04:28:11.786
1216	/20210603032718-ReorderFijiCovidVaccineMapOverlays-modifies-data	2021-06-18 04:28:11.834
1217	/20210603034000-AddFijiCovid19SubDivisions-modifies-data	2021-06-18 04:28:12.156
1218	/20210603064215-migrateFijiFacilitiesToNewSubDivisions-modifies-data	2021-06-18 04:28:12.503
1219	/20210603231415-FixCOVIDVaccineFijiEntityDataSourceTypes-modifies-data	2021-06-18 04:28:12.628
1220	/20210603231515-FixCOVIDVaccineNauruEntityDataSourceTypes-modifies-data	2021-06-18 04:28:12.716
1221	/20210604004937-AddNewNationalLevelCovidTrackingByGenderDashboard-modifies-data	2021-06-18 04:28:12.772
1222	/20210604010622-AddTotalNumberOfPeopleReceive1stDoseCovidVaccineView-modifies-data	2021-06-18 04:28:12.868
1223	/20210604010722-AddTotalNumberOfPeopleReceive2ndDoseCovidVaccineView-modifies-data	2021-06-18 04:28:12.918
1224	/20210604015355-DeleteDuplicatedCovid19FijiDashboardGroup-modifies-data	2021-06-18 04:28:12.931
1225	/20210610005659-DeleteCovid19FJFacilityOverlays-modifies-data	2021-06-18 04:28:12.956
1226	/20210610013423-RemoveCovid19ByGenderReportFromDashboardGroup-modifies-data	2021-06-18 04:28:12.983
1227	/20210611132837-RemoveFijiVillagesFromCanonicalHierarchies-modifies-data	2021-06-18 04:28:13.044
1228	/20210614003043-RemoveUserRewardsTable-modifies-schema	2021-06-18 04:28:13.064
1229	/20210615034653-AddCovidFijiSubDivisonDashboardGroup-modifies-data	2021-06-18 04:28:13.106
1230	/20210615042534-AddFijiCovidPercentageEligiableDashboards-modifies-data	2021-06-18 04:28:13.173
1231	/20210615060723-CreateSubDistrictFijiVaccinationDoseDashboardReports-modifies-data	2021-06-18 04:28:13.225
1232	/20210615064531-ReorderCovidFJSubDistrictDashboardReports-modifies-data	2021-06-18 04:28:13.242
1233	/20210615072057-UpdateUnfpaNonCanonicalRelations-modifies-data	2021-06-18 04:28:13.379
1234	/20210616011417-CovidFijiMoveRotumaFacilities-modifies-data	2021-06-18 04:28:13.941
1235	/20210616234103-UpdateCovid19FijiToPublic-modifies-data	2021-06-18 04:28:13.976
1236	/20210607020237-AddIndicatorsForAuFlutracking-modifies-data	2021-06-24 22:28:40.269
1237	/20210610060144-AddFluTrackerLGAPercentNonFirstNationsILI-modifies-data	2021-06-24 22:28:40.343
1238	/20210615035418-DropVillagesFromLESMIS-modifies-data	2021-06-24 22:28:46.319
1239	/20210524111255-StriveAdultTrappingReportConfig-modifies-data	2021-07-02 04:41:59.652
1240	/20210524113244-StriveAdultTrappingDashboardReport-modifies-data	2021-07-02 04:41:59.724
1241	/20210607052816-CreatePostCodeEntityType-modifies-schema	2021-07-02 04:42:00.625
1242	/20210607053528-AddPostcodeLevelDataInAU-modifies-data	2021-07-02 04:42:00.654
1243	/20210610104054-MosquitoSpeciesMapOverlay-modifies-data	2021-07-02 04:42:00.696
1244	/20210610111044-AddReportForMosquitoSpecieesMapOverlay-modifies-data	2021-07-02 04:42:00.749
1245	/20210621215753-LESMISDropNonOperationalSchools-modifies-data	2021-07-02 04:44:57.427
1246	/20210622010643-UnfpaMonthly3MethodsBug-modifies-data	2021-07-02 04:44:58.058
1247	/20210629081741-UpdateFanafanaolaProjectDefaultDashboard-modifies-data	2021-07-02 04:44:58.077
1248	/20210629111111-01-CreateDashboardItemsTableLayout-modifies-schema	2021-07-02 04:44:58.155
1249	/20210629111111-02-MigrateCurrentDashboardsToNewDashboards-modifies-data	2021-07-02 04:45:01.322
1250	/20210629111111-03-FixCustomLegacyReports-modifies-data	2021-07-02 04:45:01.45
1251	/20210629111111-04-AddNumberOfSchoolsByLevelOfEducationVisuals-modifies-data	2021-07-02 04:45:01.538
1252	/20210629111111-05-AddNumSchoolsByDistrictLESMIS-modifies-data	2021-07-02 04:45:01.623
1253	/20210629111111-06-LESMISStudentCountToStackedBar-modifies-data	2021-07-02 04:45:01.729
1254	/20210629111111-07-AddDropoutRateByGrade-modifies-data	2021-07-02 04:45:01.89
1255	/20210629111111-08-AddNERGERLESMIS-modifies-data	2021-07-02 04:45:02.077
1256	/20210629111111-09-AddNumSecondaryClassroomsLESMIS-modifies-data	2021-07-02 04:45:02.167
1257	/20210629111111-10-AddNumPrimaryClassroomsLESMIS-modifies-data	2021-07-02 04:45:02.25
1258	/20210629111111-11-AddChildrenOverAgeLESMIS-modifies-data	2021-07-02 04:45:02.359
1259	/20210629111111-12-LESMISDropObsoleteDashboardItem-modifies-data	2021-07-02 04:45:02.38
1260	/20210629111111-13-LESMISStudentsByEthnicity-modifies-data	2021-07-02 04:45:02.456
1261	/20210629111111-14-AddNumberSchoolsPublicPrivateESSDP-modifies-data	2021-07-02 04:45:02.587
1262	/20210629111111-15-AddNumberTeachersByEducationLevel-modifies-data	2021-07-02 04:45:02.676
1263	/20210629111111-16-LESMISGrossIntakeRate-modifies-data	2021-07-02 04:45:02.85
1264	/20210629111111-17-LESMISAgeOfGrade1Entrance-modifies-data	2021-07-02 04:45:02.93
1265	/20210629111111-18-AddRepetitionRateLESMIS-modifies-data	2021-07-02 04:45:03.07
1266	/20210629111111-19-AddCohortSurvivalRatesLESMIS-modifies-data	2021-07-02 04:45:03.205
1267	/20210629111111-20-LESMISCompleteAndIncompleteSchools-modifies-data	2021-07-02 04:45:03.281
1268	/20210629111111-21-AddNumberClassesPublicSchoolsLESMIS-modifies-data	2021-07-02 04:45:03.415
1269	/20210629111111-22-FixTypoInTitles-modifies-data	2021-07-02 04:45:03.437
1270	/20210629111111-23-LESMISHeadingsOrderChange-modifies-data	2021-07-02 04:45:03.505
1271	/20210629111111-24-ImproveYAxisLabels-modifies-data	2021-07-02 04:45:03.525
1272	/20210629111111-25-DeleteSlowCountryLevelVisuals-modifies-data	2021-07-02 04:45:03.541
1273	/20210629111111-26-FixTitlesGIRVisuals-modifies-data	2021-07-02 04:45:03.584
1274	/20210629111111-27-CorrectDropoutRatePercentageCalculation-modifies-data	2021-07-02 04:45:03.654
1275	/20210527034457-StriveLarvalHabitatBySpeciesBarChart-modifies-data	2021-07-08 22:26:33.282
1276	/20210527034536-ReportConfigLarvalHabitatBySpecies-modifies-data	2021-07-08 22:26:33.391
1277	/20210601015828-AddStriveLabConfirmedPostiveResultsStackedBarChart-modifies-data	2021-07-08 22:26:33.533
1278	/20210618033026-PGStriveAverageMortalityMatrixTable-modifies-data	2021-07-08 22:26:33.624
1279	/20210621034818-FixSbAtLeastOneStaffMemberTrained-modifies-data	2021-07-08 22:26:33.714
1280	/20210629000039-CapitcaliseAnswersForSTRVECLHS36-modifies-data	2021-07-08 22:26:34.013
1281	/20210705014650-AddNumberOfECETeachersVis-modifies-data	2021-07-08 22:26:34.092
1282	/20210705232257-DropDeprecatedDashboardReportAndDashboardGroupTables-modifies-schema	2021-07-08 22:26:34.111
1283	/20201213231508-UseTupaiaAsServiceCovidauFluTracker-modifies-data	2021-07-15 23:16:15.28
1284	/20201214034339-UpdateCovidReportsForTupaiaDataSource-modifies-data	2021-07-15 23:16:16.335
1285	/20201214060202-DeleteCovidauDhisSyncData-modifies-data	2021-07-15 23:17:09.734
1286	/20210608060150-MigrateCovidAUAndFluTrackingDashboardsToUseCorrectAggregation-modifies-data	2021-07-15 23:17:10.016
1287	/20210610002626-RewriteTotalTestsPerCapitaToUseIndicator-modifies-data	2021-07-15 23:17:10.165
1288	/20210610012019-MigrateCovidAUMapOverlayToUseCorrectAggregation-modifies-data	2021-07-15 23:17:10.319
1289	/20210705111800-LESMISAddEmergencyInEducationDashboard-modifies-data	2021-07-15 23:17:10.473
1290	/20210709031533-UnfpaMarshallIslandsMissing-modifies-data	2021-07-15 23:17:10.55
1291	/20210712021147-FixUnfpaDashboardMissingFiji-modifies-data	2021-07-15 23:17:10.593
1292	/20210713012631-AddPostcodeTypeToExplore-modifies-data	2021-07-15 23:17:10.654
1293	/20210713232632-ExcludePostcodesFromExploreSearch-modifies-data	2021-07-15 23:17:10.677
1294	/20210204224602-AddFetpGraduateLocationsMatrix-modifies-data	2021-07-23 02:08:13.283
1295	/20210228111231-AddFetpGradLocationsMatrixDistrict-modifies-data	2021-07-23 02:08:13.381
1296	/20210706044733-SwitchLGALevelMapOverlayToUseReportServer-modifies-data	2021-07-23 02:08:13.593
1297	/20210712082624-AddAdminPanelSessionTable-modifies-schema	2021-07-23 02:08:13.624
1298	/20210719023634-CorrectNumberTeachersByEducationLevel-modifies-data	2021-07-23 02:08:13.672
1299	/20210719092820-UpdatePermissionGroupHierarchy-modifies-data	2021-07-23 02:08:13.768
1300	/20210722044503-FixDataSourceEntityTypeLesmisProvinceStudentDashboards-modifies-data	2021-07-23 02:08:13.813
1301	/20210629030241-WeeklyCasesDashboardForFijiDemoFacility-modifies-data	2021-07-30 00:15:24.222
1302	/20210629030806-MapoverlaysForPsssFijiFacilityDemo-modifies-data	2021-07-30 00:15:24.464
1303	/20210713071004-AddFluTrackerNonFirstNationWithIliMapOverlay-modifies-data	2021-07-30 00:15:24.562
1304	/20210714013524-DeleteDuplicateCountriesFromEntityTable-modifies-data	2021-07-30 00:15:25.118
1305	/20210719025659-AddFluTrackerFirstNationWithIliMapOverlay-modifies-data	2021-07-30 00:15:25.278
1306	/20210719233312-CovidauMapoverlaysWeeklySelector-modifies-data	2021-07-30 00:15:25.38
1307	/20210723000500-TwoAdditionServicesToDashboardUnfpa-modifies-data	2021-07-30 00:15:25.537
1308	/20210723034733-SwitchLesmisVitalsToUseEntityAggregation-modifies-data	2021-07-30 00:15:25.587
1309	/20210803014704-CovidSamoaAddSubDistrictEntities-modifies-data	2021-08-05 00:55:51.788
1310	/20210803033646-CovidSamoaSubDistrictRelations-modifies-data	2021-08-05 00:55:51.969
1311	/20210803035205-CovidSamoaAddVillageEntityRelations-modifies-data	2021-08-05 00:55:52.396
1312	/20210803060714-CreateHouseholdEntityType-modifies-schema	2021-08-05 00:55:53.707
1313	/20210803070618-AddCovidSamoaHouseholdVaccinationStatusMapOverlays-modifies-data	2021-08-05 00:55:53.881
1314	/20210803075429-CovidSamoaAddHouseholds-modifies-data	2021-08-05 00:57:06.078
1315	/20210803083523-AddCovidSamoaSubDistrictVaccinationTrackingMapOverlays-modifies-data	2021-08-05 00:57:06.515
1316	/20210803095245-CovidSamoaUpdateUnknownVillageParent-modifies-data	2021-08-05 00:57:06.612
1317	/20210803103637-CovidSamoaRemoveFacilityMapOverlays-modifies-data	2021-08-05 00:57:06.642
1318	/20210804020340-CovidSamoaRemoveHousholdOverlay-modifies-data	2021-08-05 00:57:06.667
1319	/20210715093133-AddMostRecentAggregationFunction-modifies-schema	2021-08-06 00:34:42.658
1320	/20210721231524-StriveMapOverlayHeadingsChanges-modifies-data	2021-08-06 00:34:42.971
1321	/20210627235940-AddSurveyPeriodGranularity-modifies-schema	2021-08-12 22:18:40.978
1322	/20210630015116-FlutrackingPostcodeOverlayReportConfig-modifies-data	2021-08-12 22:18:41.909
1323	/20210630053253-AddPostcodePercentFeverOverlayFlutracking-modifies-data	2021-08-12 22:18:42.03
1324	/20210728004659-RenameAnswerForOneOptionFromQuestion-modifies-data	2021-08-12 22:18:42.143
1325	/20210809024412-AddConfigForSumTillLatest-modifies-data	2021-08-12 22:18:42.346
1326	/20210809034325-CreateLarvaeHabitatsEntityType-modifies-schema	2021-08-12 22:18:43.051
1327	/20210720001222-AddKoBoToDataServiceTypes-modifies-schema	2021-08-19 22:25:00.154
1328	/20210727041905-AddSyncCursorTable-modifies-schema	2021-08-19 22:25:00.525
1329	/20210727042329-AddKoBoSyncCursor-modifies-data	2021-08-19 22:25:00.569
1330	/20210728015657-AddDataServiceSyncGroupTable-modifies-schema	2021-08-19 22:25:00.617
1331	/20210728020128-AddFQSSurveySyncGroups-modifies-data	2021-08-19 22:25:00.908
1332	/20210804234015-AddKoBoDataSourceEntities-modifies-data	2021-08-19 22:25:02.337
1333	/20210805212932-AddSyncServiceLogTable-modifies-schema	2021-08-19 22:25:10.348
1334	/20210809040122-PmosIndicators-modifies-data	2021-08-19 22:25:10.427
1335	/20210811234228-AddLESMISTargetDistricts-modifies-data	2021-08-19 22:25:10.608
1336	/20210813034157-SOL149DeleteFacility-modifies-data	2021-08-19 22:25:10.859
1337	/20210816012839-AddProjectPacmossi-modifies-data	2021-08-19 22:25:11.292
1338	/20210816014247-AddConnectNullsToViewConfig-modifies-data	2021-08-19 22:25:11.419
1339	/20210816014347-AddConnectNullsToViewConfigAtOtherLevels-modifies-data	2021-08-19 22:25:11.521
1340	/20210819000200-AddGeneralDashboardsToNauruEHealth-modifies-data	2021-08-19 22:25:12.342
1342	/20210708023241-LESMISListVisualSummaryReport-modifies-data	2021-08-27 01:20:23.688
1343	/20210714053110-FirstNationWithILIGraph-modifies-data	2021-08-27 01:20:23.779
1344	/20210727021539-UpdateReportFlutrackerFirstNationIli-modifies-data	2021-08-27 01:20:23.82
1345	/20210810040153-FQSVisualsInLESMIS-modifies-data	2021-08-27 01:20:23.967
1346	/20210812035000-AddSomeUsefulLESMISIndicators-modifies-data	2021-08-27 01:20:24.025
1347	/20210812035022-ICTAmenitiesAvailability-modifies-data	2021-08-27 01:20:24.166
1348	/20210813012332-DeleteImmsProjectAndVizes-modifies-data	2021-08-27 01:20:24.565
1349	/20210816230203-MoveAnalyticsTableUtilityFunctionsToDatabaseFunctions-modifies-schema	2021-08-27 01:31:00.99
1350	/20210822232521-LESMISVisualSchoolLevelAmenities-modifies-data	2021-08-27 01:31:01.95
1351	/20210823022418-LESMISTeachersInPublicSchoolsVisual-modifies-data	2021-08-27 01:31:02.582
1352	/20210823024448-AddPacMOSSIMosquitoOccurenceDashboard-modifies-data	2021-08-27 01:31:03.12
1353	/20210825225206-SwitchSumInReportServerToAcceptingManyArgs-modifies-data	2021-08-27 01:31:03.271
1354	/20210827024648-UpdateAnalyticsTableToHandleYesNoAnswers-modifies-schema	2021-08-27 08:19:53.367
1355	/20210831004115-RemoveAndUpdateCovidSamoaVailoaPalauliEntities-modifies-data	2021-08-31 11:24:02.213
1356	/20210831043801-AddEntitiesRelationToSamoaForPenfaaSamoa-modifies-data	2021-08-31 11:24:02.313
1357	/20210831074805-AddSubDistrictParentsSamoa-modifies-data	2021-08-31 11:24:02.466
1358	/20210812034759-AdultMosquitoOccurrenceByFieldStation-modifies-data	2021-09-02 22:28:42.119
1359	/20210823032403-LESMISChildrenOverAgeForGradeVisual-modifies-data	2021-09-02 22:28:42.269
1360	/20210824005652-LESMISNumberOfPublicPrivateClassrooms-modifies-data	2021-09-02 22:28:42.376
1361	/20210804054649-CovidSamoaReinstateHouseholdOverlay-modifies-data	2021-09-05 23:15:40.369
1362	/20210805035710-CovidSamoaAddHouseholdPointdata-modifies-data	2021-09-05 23:16:30.493
1363	/20210902055844-UpdateUNFPASbRawDataDownloadSurvey-modifies-data	2021-09-05 23:16:30.864
1364	/20210810063133-AddFijiCOVIDDashboardCasesVsDeaths-modifies-data	2021-09-10 02:20:46.503
1365	/20210824045814-AddPacMossiRawDataDownload-modifies-data	2021-09-10 02:20:46.623
1366	/20210825230542-LESMISProvinceNationalDropOutRates-modifies-data	2021-09-10 02:20:46.764
1367	/20210902032838-AddPacMossiOverlayOccurranceGenusDistrictCountry-modifies-data	2021-09-10 02:20:46.887
1368	/20210824064634-CreateMapOverlayGroupForPacmosss-modifies-data	2021-09-17 00:28:08.643
1369	/20210824231816-DistributionOfSpeciesPacmoss-modifies-data	2021-09-17 00:28:08.77
1370	/20210901021333-MosquitoSpeciesPacMossiMapOverlay-modifies-data	2021-09-17 00:28:08.884
1371	/20210901022638-AddReportForMosquitoSpeciesPacmossi-modifies-data	2021-09-17 00:28:08.928
1372	/20210905222526-ESSDPAddHLODashboardHeaders-modifies-data	2021-09-17 00:28:09.047
1373	/20210905333536-ESSDPListVisualNumberOfStudentsDrillDowns-modifies-data	2021-09-17 00:28:09.139
1374	/20210906025641-ESSDPListVisualNumberOfStudents-modifies-data	2021-09-17 00:28:09.418
1375	/20210908210327-LESMISListVisual-water-supply-modifies-data	2021-09-17 00:28:09.479
1376	/20210909220543-NumberOfStudentsUpdateReportConfigs-modifies-data	2021-09-17 00:28:09.598
1377	/20210910022500-ConvertExistingReportsToNewTransformSyntax-modifies-data	2021-09-17 00:28:10.898
1378	/20210913013108-AddFijiCOVIDDashboardTestsByDay-modifies-data	2021-09-17 00:28:11.058
1379	/20210914232504-UpdateUNFPAWsRawDataDownloadSurvey-modifies-data	2021-09-17 00:28:11.553
1380	/20210907111655-LESMISNonTargetDistricts-modifies-data	2021-09-28 03:29:24.906
1381	/20210907222655-LESMISPrimaryEducationCohortSurvivalRate-modifies-data	2021-09-28 03:29:25.125
1382	/20210912223650-LESMISVitalsUseEntityAggregation-modifies-data	2021-09-28 03:29:25.337
1383	/20210914035116-AddLegacyOptionsToMapOverlayTable-modifies-schema	2021-10-04 22:58:35.605
1384	/20210914044208-LESMIS-GER-Map-Overlays-modifies-data	2021-10-04 22:58:36.649
1385	/20210920050147-NetEnrolmentRatesMapOverlayLaos-modifies-data	2021-10-04 22:58:37.331
1386	/20210920234840-DefaultMeasureOnlyUseMainMapOverlayId-modifies-data	2021-10-04 22:58:37.375
1387	/20210921051858-LESMISRepititionRatesDistrict-modifies-data	2021-10-04 22:58:37.459
1388	/20210921183003-remove-laos-schools-map-overlay-modifies-data	2021-10-04 22:58:37.562
1389	/20210921211920-LESMIS-GIR-map-overlays-modifies-data	2021-10-04 22:58:37.758
1390	/20210922211939-LESMIS-number-of-schools-overlays-modifies-data	2021-10-04 22:58:37.929
1391	/20210923011806-LESMISEnrolmentRateMapOverlays-modifies-data	2021-10-04 22:58:38.077
1392	/20210923024807-LESMISDropOutRateDistrictOverlay-modifies-data	2021-10-04 22:58:38.163
1393	/20210924030256-lesmis-number-of-students-overlays-modifies-data	2021-10-04 22:58:38.412
1394	/20211010204857-UpdateTongaPermissionGroup-modifies-data	2021-10-11 20:54:32.261
1395	/20211011020420-UpdateDashboardRelationsForPermissionGroupNameChange-modifies-data	2021-10-11 20:54:32.28
1396	/20210818014247-AddFijiCovid7DayPositivityIndicator-modifies-data	2021-10-18 23:11:22.874
1397	/20210913030808-AddCovidFiji7DayPositivityRateReport-modifies-data	2021-10-18 23:11:22.974
1398	/20210913042439-Add7DayPositivityMapOverlayCovidFiji-modifies-data	2021-10-18 23:11:23.105
1399	/20210927003701-LESMIS5YearOldEnrolmentRateMapOverlays-modifies-data	2021-10-18 23:11:23.237
1400	/20211006023659-LESMISDropOutRateProvinceOverlay-modifies-data	2021-10-18 23:11:23.379
1401	/20211006024728-LESMISRemoveProvinceOverlayGroupRelationRepetitionRates-modifies-data	2021-10-18 23:11:23.504
1402	/20211013004912-DeleteOldTestAccounts-modifies-data	2021-10-18 23:11:23.561
1403	/20211014051346-LowerCaseMapOverlayTable-modifies-schema	2021-10-18 23:11:31.583
1404	/20211014062930-SplitMapOverlayLegacyReportsOut-modifies-schema	2021-10-18 23:11:32.933
1405	/20211015225954-updateOverlayRelationsToUseIds-modifies-data	2021-10-18 23:11:33.106
1406	/20211018050629-SUPPLYCHAINFJAddMapOverlayLaboratoryItemAvailability-modifies-data	2021-10-26 02:22:33.95
1407	/20211027200821-lesmis-update-reporting-on-sdgs-dashboards-modifies-data	2021-10-27 20:41:14.568
1408	/20211101040146-WAI-1021-TongaContactTracingVisual-modifies-data	2021-11-02 00:29:03.579
1409	/20211102023345-TongaContactTracingCustomRawDataDownload-modifies-data	2021-11-03 06:40:45.893
1410	/20211004024719-AddReportsVaccineMapOverlaysCappedFJ-modifies-data	2021-11-08 20:48:15.85
1411	/20211006084738-AddReportsVaccineMapOverlaysCappedWS-modifies-data	2021-11-08 20:48:16.019
1412	/20211019223410-ConvertFanfanaOlaHpuOverlaysToReportServer-modifies-data	2021-11-08 20:48:16.221
1413	/20211025212049-DeleteSamoaVillageEntityAlafou-modifies-data	2021-11-08 20:48:16.99
1414	/20211117221003-AddVillageParentsForCovidSamoaHierarchy-modifies-data	2021-11-18 01:41:32.673
1415	/20211110233036-TongaCovid19TestLocations-modifies-data	2021-11-22 21:42:35.669
1416	/20211123053316-AddProjectPenFaaSamoa-modifies-data	2021-11-29 21:50:09.083
1417	/20211123223023-DeleteAccidentalTestCountry-modifies-data	2021-11-29 21:50:09.257
1418	/20211124053026-AddMapOverlayGroupForNcd-modifies-data	2021-11-29 21:50:09.325
1475	/20220119005332-UpdateTongaCovidPermissions-modifies-data	2022-01-24 22:49:16.616
1476	/20211121221500-AddApprovalColumns-modifies-schema	2022-02-01 22:42:00.939
1477	/20211125004704-UpdateAnalyticsTableForApprovalStatus-modifies-schema	2022-02-01 23:21:28.055
1478	/20220122223251-PenFaaSamoaAddVillageSchoolEntityRelations	2022-02-07 23:31:49.31
1479	/20220201052718-DeleteDuplicateSamoaSchoolEntities-modifies-data	2022-02-07 23:31:50.897
1480	/20220203064851-AddDataLakeServiceType-modifies-schema	2022-02-14 21:17:19.809
1481	/20220208004345-RemoveApostropheFromAustralianEntityCode-modifies-data	2022-02-14 21:17:20.992
1426	/20211125021151-ChangePermissionForPenFaa-modifies-data	2021-12-02 07:56:58.451
1482	/20220210214956-UpdateCovid19SamoaVisualisationPermissions-modifies-data	2022-02-21 21:35:16.153
1483	/20220210235957-UnfpaMarshallIslandsAddFacilities-modifies-data	2022-02-21 21:35:16.361
1484	/20220218050602-AddCovidKiribatiProject-modifies-data	2022-02-21 21:35:16.438
1485	/20220221232146-AddDataElementFromDataLakeToTupaia-modifies-data	2022-02-22 02:40:11.274
1446	/20211126004049-AddPrimaryPlatformToUsersTable-modifies-schema	2021-12-06 21:03:19.715
1447	/20211130040028-UpdateFacilityNamesSolomonIslands-modifies-data	2021-12-06 21:03:20.95
1448	/20211201030947-SamoaDeleteDuplicateSchool-modifies-data	2021-12-06 21:03:22.821
1449	/20211201052040-AddPhiPermissionGroup-modifies-data	2021-12-06 21:03:22.882
1450	/20211201223600-DeleteCovid19SurveillanceDashbaord-modifies-data	2021-12-06 21:03:22.907
1467	/20211201090124-MergeFlutrackingResponses-modifies-data	2021-12-07 22:16:24.794
1468	/20211207002048-DropNotificationTriggerFromReportTable-modifies-schema	2021-12-14 01:26:05.852
1469	/20211209033916-SeparateFlutrackingAndCovid19Projects-modifies-data	2021-12-14 01:26:07.046
1470	/20211115202946-LESMISESSDPDrillDown5Year40District-modifies-data	2022-01-20 01:09:44.778
1471	/20220105040520-AddIndividualToFanafanaEntityHierarchy-modifies-data	2022-01-20 01:09:44.993
1472	/20220107050226-AddFlutrackingPostcodeMapOverlayGroup-modifies-data	2022-01-20 01:09:45.154
1473	/20220107061813-SetMapOverlayGroupCodeAsUniqueKey-modifies-schema	2022-01-20 01:09:45.35
1474	/20220117011411-CovidSamoaDeleteOutdatedResponses-modifies-data	2022-01-20 04:20:56.496
1486	/20220222043511-UnfpaMarshallIslandsAddMissingFacility-modifies-data	2022-02-24 02:37:26.283
1487	/20220223024636-AddVillageToCovidKiribatiProjectHeirarchy-modifies-data	2022-02-24 02:37:26.36
1488	/20220223052221-DeleteInvalidKiribatiEntities-modifies-data	2022-02-25 00:06:04.303
1489	/20220218015022-AddDataLakeDataElementsIntoTupaiaDataSource-modifies-data	2022-02-28 23:26:28.042
1490	/20220303051055-AddPalauToPacmossiProject-modifies-data	2022-03-08 05:36:46.918
1491	/20220309231120-AddCovidDataLakeDataElementsIntoTupaiaDataSource-modifies-data	2022-03-11 02:38:02.596
1492	/20220211015354-AddConstraintSurveyCodeLength-modifies-schema	2022-04-05 00:53:00.916
1493	/20220405032953-UpdateAnalyticsTableToHandleEntityTypeAnswer-modifies-schema	2022-04-20 01:39:22.307
1494	/20220513032539-ReinstateMissingEntityAnswersC19TestRegistration-modifies-data	2022-05-15 23:25:48.911
1495	/20220407063942-AddPngEntitiesAndUpdateRelationsForStrive-modifies-data	2022-05-17 06:29:13.096
1496	/20220515045038-AddEntityTypeLocalGov-modifies-schema	2022-05-17 06:29:13.196
1497	/20220516000532-AddProjectImpactHealth-modifies-data	2022-05-17 06:29:15.319
1498	/20220518002531-AddFacilityEntitiesForImpactHealth-modifies-data	2022-05-18 08:16:07.198
1499	/20220520063938-ExcludeBetioFromCovidKiribatiProject-modifies-data	2022-05-31 00:26:48.994
1500	/20220523020255-AddEntityTypesMedicalAreaAndNursingZone-modifies-schema	2022-05-31 00:26:49.485
1501	/20220523032848-AddProjectMassDrugAdministration-modifies-data	2022-05-31 00:26:50.943
1502	/20220524011100-AddProjectCovidSolomonIslands-modifies-data	2022-05-31 00:26:51.768
1503	/20220531030730-RerunMigrationToReinstateMissingEntityAnswersC19TestRegistration-modifies-data	2022-05-31 06:35:49.385
1504	/20220520141500-SplitDataSourceTable-modifies-schema	2022-06-21 09:25:20.818
1505	/20220520141600-AddPermissionGroupsToDataSources-modifies-schema	2022-06-21 09:25:32.591
1506	/20220520141700-UpdateDataElementPermissionsFromVisuals-modifies-data	2022-06-21 09:50:16.716
1507	/20220623233124-AddHouseholdsToEntityHierarchyCanonicalTypes-modifies-data	2022-06-24 04:20:10.871
1508	/20220614225441-AddLoggingForAllServicesApiRequestLog-modifies-schema	2022-06-28 02:12:13.906
1509	/20220615053401-AddSamoaToPacMossiProject-modifies-data	2022-06-28 02:12:14.954
1510	/20220615070630-UpdateEntityRelationsForSamatauVillageSamoa-modifies-data	2022-06-28 02:12:15.098
1511	/20220616025825-DeleteCovidMinisterViewDashboard-modifies-data	2022-06-28 02:12:15.401
1512	/20220706235939-Maui4CleanupFijiFacilities-modifies-data	2022-07-12 02:20:22.644
1513	/20220710234424-UpgradeFrontendExcludedTypesConfig-modifies-data	2022-07-13 04:52:02.235
1514	/20220714065133-AddEntityImageHookToHouseholdQuestion-modifies-data	2022-07-15 05:04:53.185
1515	/20220707245124-SetNiueParentToWorld-modifies-data	2022-07-26 00:50:03.693
1516	/20220512232924-CreateDhisInstanceTable-modifies-schema	2022-08-09 02:38:49.574
1517	/20220513014400-AddDhisInstances-modifies-data	2022-08-09 02:39:56.425
1518	/20220718043838-UnfpaAddMHFacilityRelations-modifies-data	2022-08-09 02:40:01.644
1519	/20220802000352-ChangeCovidSamoaProjectName-modifies-data	2022-08-09 02:40:03.279
1520	/20220804020223-DeletePalauEnviroHealthEntities-modifies-data	2022-08-09 02:42:10.357
1521	/20220622064208-AddArrayConcatAggregationFunction-modifies-schema	2022-08-24 02:09:49.684
1522	/20220810013153-UpdateAllNonRegionalDhisInstanceConfigDataElementsAndGroups-modifies-data	2022-08-24 02:10:55.565
1523	/20220630013151-LinkSyncServiceToSurvey-modifies-schema	2022-09-06 04:53:40.71
1524	/20220811014552-CreateSupersetInstanceTable-modifies-schema	2022-09-06 04:53:43.076
1525	/20220812055419-MoveSyncServiceToDataServiceSyncGroup-modifies-schema	2022-09-06 04:53:47.024
1526	/20220819002505-AddEntityAttributeHookHouseholdHeadToQuestion-modifies-data	2022-09-06 04:53:51.026
1527	/20220819055530-DeletePgFacilities-modifies-data	2022-09-06 04:56:17.807
1528	/20220822035354-AddSyncStatusToSyncGroup-modifies-schema	2022-09-06 04:56:17.831
1529	/20220901060328-AddProjectTuvaluEhealth-modifies-data	2022-09-06 04:56:21.444
1530	/20220822025509-AddDataElementDataServiceTable-modifies-schema	2022-09-20 03:39:40.664
1531	/20220823234713-AddUserFavouriteDashboardTable-modifies-schema	2022-09-20 03:39:41.726
1532	/20220829032330-AddConstraintDataServiceConfig-modifies-schema	2022-09-20 03:39:44.744
1533	/20220905010529-AddEntityTypeFETPGraduate-modifies-schema	2022-09-20 03:39:59.512
1534	/20220905020318-UpdateIndividualEntityTypeToFetpGraduateForFETPProject-modifies-data	2022-09-20 03:40:29.937
1535	/20220908010028-AddDataTableModel-modifies-schema	2022-09-20 03:40:31.698
1536	/20220908043740-AddConstraintDataElementDataServiceTable-modifies-schema	2022-09-20 03:40:33.615
1537	/20220908093833-DeletePermissionGroupDEehVectorSurveillance-modifies-data	2022-09-20 03:40:34.715
1538	/20220909021244-AddAnalyticsDataTable-modifies-data	2022-09-20 03:40:35.997
1539	/20220915060402-AddEventsDataTable-modifies-schema	2022-09-20 03:40:36.441
1540	/20220920051046-RestoreEntityNameInAnalytics-modifies-schema	2022-10-04 01:34:35.375
1541	/20220920062403-AddEntityIdIndexOnSurveyResponseTable-modifies-schema	2022-10-04 01:35:41.726
1542	/20220916024924-AddUnfpaFacilities-modifies-data	2022-10-17 23:48:26.256
1543	/20220925225155-AddSupersetMappings-modifies-data	2022-10-17 23:48:26.371
1544	/20221001204123-AddExternalDatabaseConnectionTable-modifies-schema	2022-11-08 01:12:59.712
1545	/20221006004520-AddEntityRelationsDataTable-modifies-data	2022-11-08 01:13:00.247
1546	/20221006010514-AddEntitiesDataTable-modifies-data	2022-11-08 01:13:01.077
1547	/20221102231839-AddNigeriaToTupaia-modifies-data	2022-11-08 01:13:01.854
1548	/20221104002716-UnfpaPopulationTileSet-modifies-data	2022-11-22 01:31:32.806
1549	/20221110021119-AddFacilitiesPenfaa-modifies-data	2022-11-22 01:31:33.685
1550	/20221111050217-AddSupersetInstances-modifies-data	2022-11-22 01:31:33.722
1551	/20221102021424-ChangeWishSubDistrictToUseNewType-modifies-data	2023-01-10 05:11:31.165
1552	/20230109035514-PalauEditAndCreatePermissions-modifies-data	2023-01-24 00:40:29.817
1553	/20230110023215-SolIslandsDeleteCovidProject-modifies-data	2023-01-24 00:40:30.105
1554	/20230118223340-ChangeSupersetCountryCodeToFj-modifies-data	2023-01-24 00:40:30.163
1555	/20230116004255-AddPermissionGroupColumnToDashboardItems-modifies-data	2023-02-14 00:20:56.161
1556	/20230119053753-ConvertInternalDataTablesToTheirOwnTypes-modifies-schema	2023-02-14 00:20:58.597
1557	/20221002042508-AddSqlDataTableType-modifies-schema	2023-02-16 13:58:55.864336
1558	/20230214033100-ChangeConstraintOnTypeAndPermissionGroupsInDataTable-modifies-schema	2023-04-13 02:01:13.311
1559	/20230216140701-MoveFetchIntoTransformInReports-modifies-data	2023-04-13 02:01:26.049
1560	/20230216141720-ConvertReportsToPullFromDataTables-modifies-schema	2023-04-13 02:01:28.794
1561	/20230217031100-AddNewDataTableTypes-modifies-schema	2023-04-13 02:01:28.848
1562	/20230219232553-AddMetadataInDataTable-modifies-data	2023-04-13 02:01:30.542
1563	/20230222233428-RewriteVizsUsedDataElementCodeToName-modifies-schema	2023-04-13 02:01:36.167
1564	/20230314005038-RewriteWishFijiBaselineVizesWithOrgUnitContext-modifies-data	2023-04-13 02:01:37.835
1565	/20230314042110-MigrateInsertNumberOfFacilitiesColumn-modifies-data	2023-04-13 02:01:38.669
1566	/20230316041331-RewriteWishFijiMatrixReports-modifies-data	2023-04-13 02:01:38.882
1567	/20230316061147-RewriteWishFijiMatrixReportsWithMultiDataElements-modifies-data	2023-04-13 02:01:38.997
1568	/20230320011713-ConvertOrgUnitCodeToNameMatrixReports-modifies-data	2023-04-13 02:01:39.722
1569	/20230321045049-AddEntityAttributesDataTableType-modifies-schema	2023-04-13 02:01:40.867
1570	/20230328002338-FixDateOffsetVizes-modifies-data	2023-04-13 02:01:41.753
1571	/20230402232608-AddEntityAttributesDataTable-modifies-data	2023-04-13 02:01:41.852
1572	/20230413041856-FixupDropAnalyticsLogTablesFunction-modifies-schema	2023-04-27 05:53:55.465
1573	/20230430221850-AddTablesForLandingPages-modifies-schema	2023-06-13 01:04:10.31
1574	/20230522070125-AddQuestionTypeEnum-modifies-schema	2023-06-13 01:04:22.852
1575	/20230529002449-AddFileQuestionType-modifies-schema	2023-06-13 01:04:23.09
1576	/20230517233806-addTupaiaWebSessionTable-modifies-schema	2023-08-01 06:34:59.237
1577	/20230822035858-AddDataTrakSessionTable-modifies-schema	2023-09-26 06:23:52.645
1578	/20230831023940-AddFarmEntityType-modifies-schema	2023-09-26 06:23:53.734
1579	/20230831024740-UpdatePalauAgricultureHierarchy-modifies-data	2023-09-26 06:23:57.445
1580	/20230915002216-DropMeditrakSyncQueueChangeTimeTrigger-modifies-schema	2023-09-26 06:24:00.874
1581	/20230919051240-AddRepairRequestEntityType-modifies-schema	2023-09-26 06:24:01.234
1582	/20230827220641-ConvertEntityScreenComponentConfig-modifies-data	2023-10-12 06:39:00.724
1583	/20230904033341-AddProjectToUserAccount-modifies-schema	2023-10-24 01:27:57.447
1584	/20230925004700-AddPreferencesToUserAccount-modifies-schema	2023-10-24 01:27:58.837
1585	/20231012204228-DetachTimorLesteFromEntityHierarchies-modifies-data	2023-10-24 01:27:59.625
1586	/20231012222503-DeleteLaosEOCAndCOVIDAuProjects-modifies-data	2023-10-24 01:28:03.858
1587	/20231026042714-AddSurveyResponsesDataTableType-modifies-schema	2023-11-07 00:58:41.091
1588	/20231026043557-AddSurveyResponsesDataTable-modifies-data	2023-11-07 00:58:41.984
1589	/20231027053345-AddDashboardMailingListTable-modifies-schema	2023-11-21 04:37:13.775
1590	/20231112212117-AddProjectIdToSurveys-modifies-schema	2023-11-23 20:56:13.69
1591	/20231119225952-AddNewSurveyProjects-modifies-data	2023-12-07 01:35:55.988
1592	/20231119234449-AddProjectIdToSurveys-modifies-data	2023-12-07 01:35:56.814
1593	/20231120003955-CreateDuplicateSurveys-modifies-data	2023-12-07 01:36:00.222
1594	/20231123022242-AddEmailAdminPermissionGroupsToDashboardMailingList-modifies-schema	2023-12-20 03:58:46.262
1595	/20231204032614-MakeEntityTypeNotNull-modifies-schema	2023-12-20 03:58:47.81
1596	/20231214020916-ResetIncorrectDefaultMeasureCodes-modifies-data	2023-12-20 03:58:49.574
1597	/20240108015220-UpdateSurveyProjectIdToBeNonNullable-modifies-schema	2024-01-16 00:39:45.84
1598	/20231211002514-MakeRelatedEntityCreateQuestionsMandatory-modifies-data	2024-01-29 23:54:20.835
1599	/20240110031515-AddDatatrakToPrimaryPlatformEnum-modifies-schema	2024-02-13 03:58:27.39
1600	/20240122235629-EnforceNotNullOnUserEntityPermissionFKEYs-modifies-schema	2024-02-13 03:58:33.288
1601	/20240131203140-AddBusinessEntityTypeNauru-modifies-schema	2024-02-13 03:58:33.806
1602	/20240213004001-GrantLESMISAdminUsersTupaiaAdminPanelAccess-modifies-data	2024-02-13 03:58:36.72
1603	/20240111020232-AddForeignKeyConstraintToReportCode-modifies-schema	2024-02-26 22:08:57.74
1604	/20240211183452-AddDashboardAttributesFilter-modifies-schema	2024-03-12 01:01:43.493
1605	/20240226202900-MigrateDisplayOnEntityConditionsToEntityAttributeFilters-modifies-data	2024-03-12 01:01:53.266
1606	/20240303205520-AddEntityAttributesFilterToMapOverlaysTable-modifies-schema	2024-03-12 01:01:53.409
1607	/20240305204428-ChangeNestedDelimiterReportConfigs-modifies-data	2024-03-12 01:01:58.767
1608	/20240213024728-AddReportLatestDataParametersColumn-modifies-schema	2024-03-26 03:33:41.277
1609	/20240312004705-SplitPieChartPresentationOptionsIntoDynamicAndStaticObjects-modifies-data	2024-03-26 03:33:52.523
1610	/20240314004136-SetEntityAttributesNonNullable-modifies-schema	2024-03-26 03:33:54.241
1611	/20240319010222-RemoveDisasterTables-modifies-schema	2024-03-26 03:33:56.338
1612	/20240319010415-RemoveDisasterDashboards-modifies-data	2024-03-26 03:34:06.142
1613	/20240319014555-RemoveDisasterEntities-modifies-data	2024-03-26 03:34:27.231
1614	/20240320201246-AddEntityTypesHealthClinicBoundaryAndEnumerationArea-modifies-schema	2024-03-26 03:34:27.597
1615	/20240320230959-RemoveDisasterPermissions-modifies-data	2024-03-26 03:34:27.885
1616	/20240321045103-SetEntityMetadataNonNullable-modifies-schema	2024-03-26 03:39:00.945
1617	/20240321062219-SetProjectPermissionGroupsNotNullable-modifies-schema	2024-03-26 03:39:03.392
1618	/20240401222409-AddMaintenanceEntityType-modifies-schema	2024-04-14 21:40:26.11
1619	/20240404003956-AddLarvalSampleEntityType-modifies-schema	2024-04-14 21:40:26.922
1620	/20240404034101-SetProjectConfigNotNull-modifies-schema	2024-04-23 01:18:02.391
1621	/20240418030017-AddTransferEntityType-modifies-schema	2024-04-23 01:18:03.214
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1621, true);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: TABLE migrations; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT ON TABLE public.migrations TO tupaia_read;


--
-- PostgreSQL database dump complete
--

