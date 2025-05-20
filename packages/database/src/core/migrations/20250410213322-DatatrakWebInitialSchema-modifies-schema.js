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

exports.up = function (db) {
  return db.executeSql(`
    --- ENTITY SCHEMA ---
    CREATE TYPE entity_type AS ENUM (
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

    CREATE TABLE entity (
      id            TEXT PRIMARY KEY,
      code          TEXT NOT NULL UNIQUE,
      parent_id     TEXT NOT NULL REFERENCES entity,
      name          VARCHAR(128)                     NOT NULL,
      type          entity_type                      NOT NULL,
      image_url     TEXT,
      country_code  VARCHAR(6),
      metadata      JSONB DEFAULT '{}'::jsonb        NOT NULL,
      attributes    JSONB DEFAULT '{}'::jsonb        NOT NULL
    );

    CREATE INDEX entity_code ON entity (code);

    CREATE INDEX entity_parent_id_key ON entity (parent_id);

    CREATE INDEX idx_entity_country_code ON entity (country_code);

    CREATE TABLE entity_hierarchy (
      id              TEXT NOT NULL PRIMARY KEY,
      name            TEXT NOT NULL UNIQUE,
      canonical_types TEXT[] DEFAULT '{}'::text[]
    );

    CREATE TABLE entity_relation (
      id                  TEXT NOT NULL PRIMARY KEY,
      parent_id           TEXT NOT NULL REFERENCES entity,
      child_id            TEXT NOT NULL REFERENCES entity,
      entity_hierarchy_id TEXT NOT NULL REFERENCES entity_hierarchy
    );

    ----------------------------

    --- DATA ELEMENT SCHEMA ---
    CREATE TYPE public.service_type AS ENUM (
      'dhis',
      'tupaia',
      'indicator',
      'weather',
      'kobo',
      'data-lake',
      'superset'
    );

    CREATE TABLE data_element (
      id                TEXT NOT NULL PRIMARY KEY,
      code              TEXT NOT NULL,
      service_type      service_type                      NOT NULL,
      config            JSONB DEFAULT '{}'::JSONB         NOT NULL,
      permission_groups TEXT[] DEFAULT '{}'::TEXT[]       NOT NULL,
      constraint valid_data_service_config
        check ((service_type <> 'dhis'::service_type) OR ((config ->> 'dhisInstanceCode'::text) IS NOT NULL))
    );

    CREATE TABLE data_group (
      id           TEXT NOT NULL PRIMARY KEY,
      code         TEXT NOT NULL,
      service_type service_type                      NOT NULL,
      config       JSONB DEFAULT '{}'::JSONB         NOT NULL,
      constraint valid_data_service_config
        check ((service_type <> 'dhis'::service_type) OR ((config ->> 'dhisInstanceCode'::text) IS NOT NULL))
    );

    CREATE TYPE question_type AS ENUM (
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

    CREATE TABLE option_set (
      id   TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE question (
      id              TEXT NOT NULL PRIMARY KEY,
      text            TEXT NOT NULL,
      name            TEXT,
      options         TEXT[],
      code            TEXT UNIQUE,
      detail          TEXT,
      option_set_id   TEXT REFERENCES option_set,
      hook            TEXT,
      data_element_id TEXT REFERENCES data_element,
      type            question_type NOT NULL
    );

    CREATE INDEX question_code_idx ON question (code);

    ----------------------------

    --- PERMISSION GROUP SCHEMA ---
    CREATE TABLE permission_group (
      id        TEXT NOT NULL PRIMARY KEY,
      name      TEXT NOT NULL UNIQUE,
      parent_id TEXT REFERENCES permission_group
        ON UPDATE CASCADE ON DELETE RESTRICT
    );

    CREATE INDEX permission_group_name_idx ON permission_group (name);

    CREATE INDEX permission_group_parent_id_idx ON permission_group (parent_id);

    ----------------------------

     --- PROJECT SCHEMA ---
    CREATE TABLE project (
      id                   TEXT NOT NULL PRIMARY KEY,
      code                 TEXT NOT NULL UNIQUE,
      description          TEXT,
      sort_order           INTEGER,
      image_url            TEXT,
      default_measure      TEXT DEFAULT '126,171'::TEXT,
      dashboard_group_name TEXT DEFAULT 'General'::TEXT,
      permission_groups    TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
      logo_url             TEXT,
      entity_id            TEXT,
      entity_hierarchy_id  TEXT REFERENCES entity_hierarchy,
      config               JSONB DEFAULT '{"permanentRegionLabels": true}'::JSONB NOT NULL
    );

    ----------------------------

    --- USER ACCOUNT SCHEMA ---
    CREATE TYPE primary_platform AS ENUM (
      'tupaia',
      'lesmis',
      'datatrak'
    );

    CREATE TYPE verified_email AS ENUM (
      'unverified',
      'new_user',
      'verified'
    );

    CREATE TABLE user_account (
      id               TEXT NOT NULL PRIMARY KEY,
      first_name       TEXT,
      last_name        TEXT,
      email            TEXT NOT NULL UNIQUE,
      gender           TEXT,
      creation_date    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      employer         TEXT,
      position         TEXT,
      mobile_number    TEXT,
      password_hash    TEXT NOT NULL,
      password_salt    TEXT NOT NULL,
      verified_email   verified_email,
      profile_image    TEXT,
      primary_platform primary_platform DEFAULT 'tupaia'::primary_platform,
      preferences      jsonb DEFAULT '{}'::jsonb NOT NULL
    );

    CREATE INDEX user_account_creation_date_idx ON user_account (creation_date);

    CREATE INDEX user_account_email_idx ON user_account (email);

    CREATE INDEX user_account_first_name_idx ON user_account (first_name);

    CREATE INDEX user_account_last_name_idx ON user_account (last_name);

    ----------------------------

    --- SURVEY SCHEMA ---

    CREATE TYPE period_granularity AS ENUM (
      'yearly',
      'quarterly',
      'monthly',
      'weekly',
      'daily'
    );

    CREATE TABLE survey_group (
      id   TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE INDEX survey_group_name_idx ON survey_group (name);

    CREATE TABLE survey (
      id                   TEXT NOT NULL PRIMARY KEY,
      name                 TEXT NOT NULL UNIQUE,
      code                 TEXT NOT NULL UNIQUE,
      permission_group_id  TEXT REFERENCES permission_group
        ON UPDATE CASCADE ON DELETE RESTRICT,
      country_ids          TEXT[] DEFAULT '{}'::TEXT[],
      can_repeat           BOOLEAN DEFAULT FALSE,
      survey_group_id      TEXT REFERENCES survey_group
        ON UPDATE CASCADE ON DELETE SET NULL,
      integration_metadata JSONB DEFAULT '{}'::jsonb,
      period_granularity   period_granularity,
      requires_approval    BOOLEAN DEFAULT FALSE,
      data_group_id        TEXT REFERENCES data_group
        ON UPDATE CASCADE ON DELETE SET NULL,
      project_id           TEXT NOT NULL REFERENCES project
    );

    CREATE INDEX survey_name_idx ON survey (name);

    CREATE INDEX survey_permission_group_id_idx ON survey (permission_group_id);

    CREATE INDEX survey_survey_group_id_idx ON survey (survey_group_id);

    CREATE INDEX survey_code_idx ON survey (code);

    CREATE INDEX survey_project_id_idx ON survey (project_id);

    CREATE TABLE survey_screen (
      id            TEXT NOT NULL PRIMARY KEY,
      survey_id     TEXT NOT NULL REFERENCES survey
        ON UPDATE CASCADE ON DELETE CASCADE,
      screen_number DOUBLE PRECISION NOT NULL
    );

    CREATE INDEX survey_screen_screen_number_idx ON survey_screen (screen_number);

    CREATE INDEX survey_screen_survey_id_idx ON survey_screen (survey_id);

    CREATE TABLE survey_screen_component (
      id                         TEXT NOT NULL PRIMARY KEY,
      question_id                TEXT NOT NULL REFERENCES question
        ON UPDATE CASCADE ON DELETE RESTRICT,
      screen_id                  TEXT NOT NULL REFERENCES survey_screen
        ON UPDATE CASCADE ON DELETE CASCADE,
      component_number           DOUBLE PRECISION NOT NULL,
      answers_enabling_follow_up TEXT[] DEFAULT '{}'::TEXT[],
      is_follow_up               BOOLEAN DEFAULT FALSE,
      visibility_criteria        VARCHAR,
      validation_criteria        VARCHAR,
      question_label             TEXT,
      detail_label               TEXT,
      config                     VARCHAR DEFAULT '{}'::character varying
    );

    CREATE INDEX survey_screen_component_component_number_idx ON survey_screen_component (component_number);

    CREATE INDEX survey_screen_component_question_id_idx ON survey_screen_component (question_id);

    CREATE INDEX survey_screen_component_screen_id_idx ON survey_screen_component (screen_id);

    CREATE TABLE survey_response (
      id              TEXT NOT NULL PRIMARY KEY,
      survey_id       TEXT NOT NULL REFERENCES survey
        ON UPDATE CASCADE ON DELETE RESTRICT,
      user_id         TEXT NOT NULL REFERENCES user_account
        ON UPDATE CASCADE ON DELETE RESTRICT,
      assessor_name   TEXT NOT NULL,
      start_time      TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time        TIMESTAMP WITH TIME ZONE NOT NULL,
      metadata        TEXT,
      timezone        TEXT,
      entity_id       TEXT NOT NULL REFERENCES entity
        ON UPDATE CASCADE ON DELETE RESTRICT,
      data_time       TIMESTAMP,
      outdated        BOOLEAN DEFAULT FALSE
    );

    CREATE INDEX survey_response_end_time_idx ON survey_response (end_time);

    CREATE INDEX survey_response_start_time_idx ON survey_response (start_time);

    CREATE INDEX survey_response_survey_id_idx ON survey_response (survey_id);

    CREATE INDEX survey_response_user_id_idx ON survey_response (user_id);

    CREATE INDEX survey_response_entity_id_idx ON survey_response (entity_id);

    CREATE INDEX survey_response_outdated_id_idx ON survey_response (outdated);

    CREATE INDEX survey_response_data_time_idx ON survey_response (data_time DESC);

    CREATE TABLE answer (
      id                 TEXT NOT NULL PRIMARY KEY,
      type               TEXT NOT NULL,
      survey_response_id TEXT NOT NULL REFERENCES survey_response
        ON UPDATE CASCADE ON DELETE CASCADE,
      question_id        TEXT NOT NULL REFERENCES question,
      text               TEXT,

      CONSTRAINT answer_survey_response_id_question_id_unique
        UNIQUE (survey_response_id, question_id)
    );

    ----------------------------
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['browser'],
};
