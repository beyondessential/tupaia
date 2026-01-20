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
  // Create entity_type enum
  await db.runSql(`
      CREATE TYPE entity_type AS ENUM (
        'asset',
        'bes_asset',
        'bes_office',
        'business',
        'case',
        'case_contact',
        'catchment',
        'city',
        'commune',
        'complaint',
        'consumable',
        'country',
        'disaster',
        'district',
        'district_operational',
        'document',
        'document_group',
        'enumeration_area',
        'facility',
        'facility_building',
        'facility_division',
        'facility_section',
        'farm',
        'fetp_graduate',
        'field_station',
        'fiji_aspen_facility',
        'health_clinic_boundary',
        'hospital_area',
        'hospital_ward',
        'household',
        'incident',
        'incident_reported',
        'individual',
        'institute',
        'kiuar_area',
        'kiuar_facility',
        'larval_habitat',
        'larval_sample',
        'local_government',
        'maintenance',
        'medical_area',
        'msupply_store',
        'nursing_zone',
        'pacmossi_asset',
        'pacmossi_asset_facility',
        'pacmossi_asset_sub_facility',
        'pacmossi_consumable',
        'pacmossi_district',
        'pacmossi_insecticide_test',
        'pacmossi_spraying_site',
        'pacmossi_village',
        'pharmacy',
        'policy',
        'postcode',
        'project',
        'rehab_facility_model',
        'repair_request',
        'school',
        'spare_part',
        'sub_catchment',
        'sub_district',
        'sub_facility',
        'supermarket',
        'tmf_district',
        'tmf_facility',
        'tmf_sub_district',
        'transfer',
        'trap',
        'vehicle',
        'village',
        'visiting_specialist',
        'water_sample',
        'wholesaler',
        'wish_sub_district',
        'world'
      );
    `);

  await db.runSql(`
    CREATE TABLE country
    (
      id                   TEXT PRIMARY KEY,
      name                 TEXT NOT NULL UNIQUE,
      code                 TEXT NOT NULL UNIQUE
    );
  `);

  // Create entity table
  await db.runSql(`
      CREATE TABLE entity (
        id            TEXT PRIMARY KEY,
        code          TEXT NOT NULL UNIQUE,
        parent_id     TEXT REFERENCES entity DEFERRABLE INITIALLY IMMEDIATE,
        name          VARCHAR(128)                     NOT NULL,
        type          entity_type                      NOT NULL,
        image_url     TEXT,
        country_code  VARCHAR(6),
        metadata      JSONB DEFAULT '{}'::jsonb        NOT NULL,
        attributes    JSONB DEFAULT '{}'::jsonb        NOT NULL
      );
    `);

  // Create entity indexes
  await db.runSql(`
      CREATE INDEX entity_code ON entity (code);
    `);

  await db.runSql(`
      CREATE INDEX entity_parent_id_key ON entity (parent_id);
    `);

  await db.runSql(`
      CREATE INDEX idx_entity_country_code ON entity (country_code);
    `);

  // Create entity_hierarchy table
  await db.runSql(`
      CREATE TABLE entity_hierarchy (
        id              TEXT NOT NULL PRIMARY KEY,
        name            TEXT NOT NULL UNIQUE,
        canonical_types TEXT[] DEFAULT '{}'::text[]
      );
    `);

  // Create service_type enum
  await db.runSql(`
      CREATE TYPE service_type AS ENUM (
        'dhis',
        'tupaia',
        'indicator',
        'weather',
        'kobo',
        'data-lake',
        'superset'
      );
    `);

  // Create question_type enum
  await db.runSql(`
      CREATE TYPE question_type AS ENUM (
        'SubmissionDate',
        'DateTime',
        'PrimaryEntity',
        'Task',
        'CodeGenerator',
        'FreeText',
        'Checkbox',
        'Geolocate',
        'Date',
        'File',
        'User',
        'Condition',
        'Binary',
        'Radio',
        'Arithmetic',
        'Number',
        'Autocomplete',
        'Entity',
        'Instruction',
        'DateOfData',
        'Photo'
      );
    `);

  // Create option_set table
  await db.runSql(`
      CREATE TABLE option_set (
        id   TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `);

  await db.runSql(`
    CREATE TABLE option
    (
      id                   TEXT PRIMARY KEY,
      value                TEXT NOT NULL,
      label                TEXT,
      sort_order           INTEGER,
      option_set_id        TEXT NOT NULL REFERENCES option_set
                            ON UPDATE CASCADE ON DELETE CASCADE,
      attributes           JSONB DEFAULT '{}'::JSONB,
      CONSTRAINT option_option_set_id_value_unique
        UNIQUE (option_set_id, value)
    );

  `);

  // Create question table
  await db.runSql(`
      CREATE TABLE question (
        id              TEXT NOT NULL PRIMARY KEY,
        text            TEXT NOT NULL,
        name            TEXT,
        options         TEXT[],
        code            TEXT UNIQUE,
        detail          TEXT,
        option_set_id   TEXT REFERENCES option_set,
        hook            TEXT,
        type            question_type NOT NULL
      );
    `);

  // Create question index
  await db.runSql(`
      CREATE INDEX question_code_idx ON question (code);
    `);

  // Create permission_group table
  await db.runSql(`
      CREATE TABLE permission_group (
        id        TEXT NOT NULL PRIMARY KEY,
        name      TEXT NOT NULL UNIQUE,
        parent_id TEXT REFERENCES permission_group
          ON UPDATE CASCADE ON DELETE RESTRICT
          DEFERRABLE INITIALLY IMMEDIATE

      );
    `);

  // Create permission_group indexes
  await db.runSql(`
      CREATE INDEX permission_group_name_idx ON permission_group (name);
    `);

  await db.runSql(`
      CREATE INDEX permission_group_parent_id_idx ON permission_group (parent_id);
    `);

  // Create project table
  await db.runSql(`
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
    `);

  // Create primary_platform enum
  await db.runSql(`
      CREATE TYPE primary_platform AS ENUM (
        'tupaia',
        'lesmis',
        'datatrak'
      );
    `);

  // Create verified_email enum
  await db.runSql(`
      CREATE TYPE verified_email AS ENUM (
        'unverified',
        'new_user',
        'verified'
      );
    `);

  // Create user_account table
  await db.runSql(`
      CREATE TABLE user_account
      (
          id                   TEXT                                         NOT NULL
              PRIMARY KEY,
          first_name           TEXT,
          last_name            TEXT,
          email                TEXT                                         NOT NULL
              UNIQUE,
          gender               TEXT,
          creation_date        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          employer             TEXT,
          position             TEXT,
          mobile_number        TEXT,
          password_hash        TEXT,
          verified_email       verified_email           DEFAULT 'new_user'::verified_email,
          profile_image        TEXT,
          primary_platform     primary_platform         DEFAULT 'tupaia'::primary_platform,
          preferences          JSONB                    DEFAULT '{}'::JSONB NOT NULL,
          access_policy        JSONB                    DEFAULT '{}'::JSONB
      );
    `);

  // Create user_account indexes
  await db.runSql('CREATE INDEX user_account_creation_date_idx ON user_account (creation_date);');
  await db.runSql('CREATE INDEX user_account_email_idx ON user_account (email);');
  await db.runSql('CREATE INDEX user_account_first_name_idx ON user_account (first_name);');
  await db.runSql('CREATE INDEX user_account_last_name_idx ON user_account (last_name);');

  // Create period_granularity enum
  await db.runSql(`
      CREATE TYPE period_granularity AS ENUM (
        'yearly',
        'quarterly',
        'monthly',
        'weekly',
        'daily'
      );
    `);

  // Create survey_group table
  await db.runSql(`
      CREATE TABLE survey_group (
        id   TEXT NOT NULL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `);

  // Create survey_group index
  await db.runSql('CREATE INDEX survey_group_name_idx ON survey_group (name);');

  // Create survey table
  await db.runSql(`
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
        project_id           TEXT NOT NULL REFERENCES project
      );
    `);

  // Create survey indexes
  await db.runSql('CREATE INDEX survey_name_idx ON survey (name);');
  await db.runSql('CREATE INDEX survey_permission_group_id_idx ON survey (permission_group_id);');
  await db.runSql('CREATE INDEX survey_survey_group_id_idx ON survey (survey_group_id);');
  await db.runSql('CREATE INDEX survey_code_idx ON survey (code);');
  await db.runSql('CREATE INDEX survey_project_id_idx ON survey (project_id);');

  // Create survey_screen table
  await db.runSql(`
      CREATE TABLE survey_screen (
        id            TEXT NOT NULL PRIMARY KEY,
        survey_id     TEXT NOT NULL REFERENCES survey
          ON UPDATE CASCADE ON DELETE CASCADE,
        screen_number DOUBLE PRECISION NOT NULL
      );
    `);

  // Create survey_screen indexes
  await db.runSql(`
      CREATE INDEX survey_screen_screen_number_idx ON survey_screen (screen_number);
    `);

  await db.runSql(`
      CREATE INDEX survey_screen_survey_id_idx ON survey_screen (survey_id);
    `);

  // Create survey_screen_component table
  await db.runSql(`
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
    `);

  // Create survey_screen_component indexes
  await db.runSql(
    'CREATE INDEX survey_screen_component_component_number_idx ON survey_screen_component (component_number);',
  );

  await db.runSql(
    'CREATE INDEX survey_screen_component_question_id_idx ON survey_screen_component (question_id);',
  );

  await db.runSql(
    'CREATE INDEX survey_screen_component_screen_id_idx ON survey_screen_component (screen_id);',
  );

  // Create survey_response table
  await db.runSql(`
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
    `);

  // Create survey_response indexes
  await db.runSql('CREATE INDEX survey_response_end_time_idx ON survey_response (end_time);');
  await db.runSql('CREATE INDEX survey_response_start_time_idx ON survey_response (start_time);');
  await db.runSql('CREATE INDEX survey_response_survey_id_idx ON survey_response (survey_id);');
  await db.runSql('CREATE INDEX survey_response_user_id_idx ON survey_response (user_id);');
  await db.runSql('CREATE INDEX survey_response_entity_id_idx ON survey_response (entity_id);');
  await db.runSql('CREATE INDEX survey_response_outdated_id_idx ON survey_response (outdated);');
  await db.runSql(
    'CREATE INDEX survey_response_data_time_idx ON survey_response (data_time DESC);',
  );

  // Create answer table
  await db.runSql(`
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
  `);

  await db.runSql('CREATE INDEX answer_question_id_idx ON answer (question_id);');

  await db.runSql(`
    CREATE TYPE task_status AS ENUM (
      'to_do',
      'cancelled',
      'completed'
    );
  `);

  await db.runSql(`
    CREATE TYPE task_comment_type AS ENUM (
      'user',
      'system'
    );
  `);

  await db.runSql(`
    CREATE TABLE task
    (
      id                   TEXT PRIMARY KEY,
      survey_id            TEXT NOT NULL REFERENCES survey
        ON UPDATE CASCADE ON DELETE CASCADE,
      entity_id            TEXT NOT NULL REFERENCES entity
        ON UPDATE CASCADE ON DELETE CASCADE,
      assignee_id          TEXT REFERENCES user_account
        ON UPDATE CASCADE ON DELETE SET NULL,
      repeat_schedule      JSONB,
      status               task_status,
      created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      survey_response_id   TEXT REFERENCES survey_response
        ON UPDATE CASCADE ON DELETE SET NULL,
      initial_request_id   TEXT REFERENCES survey_response
        ON UPDATE CASCADE ON DELETE SET NULL,
      due_date             DOUBLE PRECISION,
      parent_task_id       TEXT REFERENCES task
        ON UPDATE CASCADE ON DELETE SET NULL,
      overdue_email_sent   TIMESTAMP WITH TIME ZONE,
      updated_at_sync_tick BIGINT DEFAULT 0 NOT NULL
    );
  `);

  await db.runSql('CREATE INDEX task_survey_id_idx ON task (survey_id);');
  await db.runSql('CREATE INDEX task_entity_id_idx ON task (entity_id);');
  await db.runSql('CREATE INDEX task_assignee_id_idx ON task (assignee_id);');
  await db.runSql('CREATE INDEX task_survey_response_id_idx ON task (survey_response_id);');
  await db.runSql('CREATE INDEX task_initial_request_id_fk ON task (survey_response_id);');
  await db.runSql('CREATE INDEX task_parent_task_id_fk ON task (parent_task_id);');

  await db.runSql(`
    CREATE TABLE task_comment
    (
      id                   TEXT PRIMARY KEY,
      task_id              TEXT NOT NULL REFERENCES task
        ON UPDATE CASCADE ON DELETE CASCADE,
      user_id              TEXT REFERENCES user_account
        ON UPDATE CASCADE ON DELETE SET NULL,
      user_name            TEXT NOT NULL,
      message              TEXT,
      type                 task_comment_type        default 'user'::task_comment_type not null,
      created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      template_variables   JSONB DEFAULT '{}'::JSONB NOT NULL,
      updated_at_sync_tick BIGINT DEFAULT 0 NOT NULL
    );
  `);

  await db.runSql('CREATE INDEX task_comment_task_id_idx ON task_comment (task_id);');
  await db.runSql('CREATE INDEX task_comment_user_id_idx ON task_comment (user_id);');

  await db.runSql(`
    CREATE TABLE user_entity_permission
    (
    id                   TEXT NOT NULL PRIMARY KEY,
    user_id              TEXT NOT NULL REFERENCES user_account
        ON UPDATE CASCADE ON DELETE CASCADE,
    entity_id            TEXT NOT NULL REFERENCES entity
        ON UPDATE CASCADE ON DELETE CASCADE,
    permission_group_id  TEXT NOT NULL REFERENCES permission_group
        ON UPDATE CASCADE ON DELETE CASCADE
    );
  `);

  await db.runSql(
    'CREATE INDEX user_entity_permission_entity_id_idx ON user_entity_permission (entity_id);',
  );
  await db.runSql(
    'CREATE INDEX user_entity_permission_permission_group_id_idx ON user_entity_permission (permission_group_id);',
  );
  await db.runSql(
    'CREATE INDEX user_entity_permission_user_id_idx ON user_entity_permission (user_id);',
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['browser'],
};
