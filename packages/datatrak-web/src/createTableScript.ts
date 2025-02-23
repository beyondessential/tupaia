export const CREATE_TABLES_SCRIPT = `
    create table spatial_ref_sys
(
    srid      integer not null
        primary key
        constraint spatial_ref_sys_srid_check
            check ((srid > 0) AND (srid <= 998999)),
    auth_name varchar(256),
    auth_srid integer,
    srtext    varchar(2048),
    proj4text varchar(2048)
);

create table admin_panel_session
(
    id                  text   not null
        primary key,
    email               text   not null,
    access_policy       jsonb  not null,
    access_token        text   not null,
    access_token_expiry bigint not null,
    refresh_token       text   not null
);

create table country
(
    id   text not null
        primary key,
    name text not null
        unique,
    code text not null
        unique
);

create table dashboard_item
(
    id                   text                        not null
        primary key,
    code                 text                        not null
        unique,
    config               jsonb   default '{}'::jsonb not null,
    report_code          text,
    legacy               boolean default false       not null,
    permission_group_ids text[],
    constraint check_code_equals_report_code
        check ((legacy = true) OR (code = report_code))
);

create table data_service_entity
(
    id          text  not null
        primary key,
    entity_code text  not null
        unique,
    config      jsonb not null
);

create table data_service_sync_group
(
    id              text         not null
        primary key,
    code            text         not null
        unique,
    config          jsonb        not null,
    data_group_code text         not null,
    sync_cursor     text            default '1970-01-01T00:00:00.000Z'::text
);

create table data_element
(
    id                text                              not null
        constraint data_source_pkey
            primary key,
    code              text                              not null,
    config            jsonb  default '{}'::jsonb        not null,
    permission_groups text[] default '{}'::text[]       not null
);

create table dhis_sync_log
(
    id             text not null
        primary key,
    record_id      text not null
        constraint dhis_sync_log_record_id_unique
            unique,
    record_type    text not null,
    imported       double precision default 0,
    updated        double precision default 0,
    deleted        double precision default 0,
    ignored        double precision default 0,
    error_list     text,
    data           text,
    dhis_reference text
);

create index dhis_sync_log_record_id_idx
    on dhis_sync_log (record_id);

create index dhis_sync_log_record_type_idx
    on dhis_sync_log (record_type);

create table dhis_sync_queue
(
    id                text not null
        primary key,
    type              text not null,
    record_type       text not null,
    record_id         text not null
        constraint dhis_sync_queue_record_id_unique
            unique,
    details           text             default '{}'::text,
    priority          integer          default 1,
    is_dead_letter    boolean          default false,
    bad_request_count integer          default 0,
    is_deleted        boolean          default false
);

create index dhis_sync_queue_record_id_idx
    on dhis_sync_queue (record_id);

create index dhis_sync_queue_record_type_idx
    on dhis_sync_queue (record_type);

create table entity
(
    id           varchar(64)                      not null
        primary key,
    code         varchar(64)                      not null
        unique,
    parent_id    varchar(64)
        constraint entity_parent_fk
            references entity,
    name         varchar(128)                     not null,
    image_url    text,
    country_code varchar(6),
    metadata     jsonb default '{}'::jsonb        not null,
    attributes   jsonb default '{}'::jsonb        not null
);

create table dashboard
(
    id               text not null
        primary key,
    code             text not null
        unique,
    name             text not null,
    root_entity_code text not null
        references entity (code)
            on update cascade on delete restrict,
    sort_order       integer
);

create table dashboard_relation
(
    id                text                      not null
        primary key,
    dashboard_id      text                      not null
        references dashboard
            on update cascade on delete restrict,
    child_id          text                      not null
        references dashboard_item
            on update cascade on delete cascade,
    project_codes     text[]                    not null
        constraint project_codes_not_empty
            check (project_codes <> '{}'::text[]),
    permission_groups text[]                    not null
        constraint permission_groups_not_empty
            check (permission_groups <> '{}'::text[]),
    sort_order        integer,
    attributes_filter jsonb default '{}'::jsonb not null
);

create index entity_code
    on entity (code);

create index entity_parent_id_key
    on entity (parent_id);

create index idx_entity_country_code
    on entity (country_code);

create table entity_hierarchy
(
    id              text not null
        primary key,
    name            text not null
        unique,
    canonical_types text[] default '{}'::text[]
);

create table ancestor_descendant_relation
(
    id                    text    not null
        primary key,
    entity_hierarchy_id   text    not null
        constraint ancestor_descendant_relation_entity_hierarchy_id_entity_hierarc
            references entity_hierarchy
            on update cascade on delete cascade,
    ancestor_id           text    not null
        constraint ancestor_descendant_relation_ancestor_id_entity_id_fk
            references entity
            on update cascade on delete cascade,
    descendant_id         text    not null
        constraint ancestor_descendant_relation_descendant_id_entity_id_fk
            references entity
            on update cascade on delete cascade,
    generational_distance integer not null
);

create index ancestor_descendant_relation_ancestor_id_idx
    on ancestor_descendant_relation (ancestor_id);

create index ancestor_descendant_relation_descendant_id_idx
    on ancestor_descendant_relation (descendant_id);

create table entity_relation
(
    id                  text not null
        primary key,
    parent_id           text not null
        references entity,
    child_id            text not null
        references entity,
    entity_hierarchy_id text not null
        references entity_hierarchy
);

create table geographical_area
(
    id         text not null
        primary key,
    name       text not null,
    level_code text not null,
    level_name text not null,
    country_id text not null
        references country
            on update cascade on delete cascade,
    parent_id  text
        references geographical_area
            on update cascade on delete cascade,
    code       text
);

create table clinic
(
    id                   text not null
        primary key,
    name                 text not null,
    country_id           text not null
        references country
            on update cascade on delete restrict,
    geographical_area_id text not null
        references geographical_area
            on update cascade on delete restrict,
    code                 text not null
        constraint clinic_code
            unique,
    type                 text,
    category_code        varchar(3),
    type_name            varchar(30)
);

create index clinic_country_id_idx
    on clinic (country_id);

create index clinic_geographical_area_id_idx
    on clinic (geographical_area_id);

create index geographical_area_country_id_idx
    on geographical_area (country_id);

create index geographical_area_parent_id_idx
    on geographical_area (parent_id);

create table indicator
(
    id      text                      not null
        primary key,
    code    text                      not null
        unique,
    builder text                      not null,
    config  jsonb default '{}'::jsonb not null
);

create table legacy_report
(
    id                  text not null
        primary key,
    code                text not null
        unique,
    data_builder        text,
    data_builder_config jsonb,
    data_services       jsonb default '[{"isDataRegional": true}]'::jsonb
);

create table lesmis_session
(
    id                  text   not null
        primary key,
    email               text   not null,
    access_policy       jsonb  not null,
    access_token        text   not null,
    access_token_expiry bigint not null,
    refresh_token       text   not null
);

create table log$_answer
(
    sequence$ bigserial
        primary key,
    m_row$    uuid                               not null,
    bitmap$   bigint[] default ARRAY [0]         not null,
    snaptime$ date     default clock_timestamp() not null,
    dmltype$  char(7)                            not null
);

create index log$_answer_bitmap$_key
    on log$_answer (bitmap$);

create table log$_data_element
(
    m_row$    uuid                                                                   not null,
    bitmap$   bigint[] default ARRAY [0]                                             not null,
    snaptime$ date     default clock_timestamp()                                     not null,
    dmltype$  char(7)                                                                not null
);

create index log$_data_source_bitmap$_key
    on log$_data_element (bitmap$);

create table log$_entity
(
    sequence$ bigserial
        primary key,
    m_row$    uuid                               not null,
    bitmap$   bigint[] default ARRAY [0]         not null,
    snaptime$ date     default clock_timestamp() not null,
    dmltype$  char(7)                            not null
);

create index log$_entity_bitmap$_key
    on log$_entity (bitmap$);

create table log$_question
(
    sequence$ bigserial
        primary key,
    m_row$    uuid                               not null,
    bitmap$   bigint[] default ARRAY [0]         not null,
    snaptime$ date     default clock_timestamp() not null,
    dmltype$  char(7)                            not null
);

create index log$_question_bitmap$_key
    on log$_question (bitmap$);

create table log$_survey
(
    sequence$ bigserial
        primary key,
    m_row$    uuid                               not null,
    bitmap$   bigint[] default ARRAY [0]         not null,
    snaptime$ date     default clock_timestamp() not null,
    dmltype$  char(7)                            not null
);

create index log$_survey_bitmap$_key
    on log$_survey (bitmap$);

create table log$_survey_response
(
    sequence$ bigserial
        primary key,
    m_row$    uuid                               not null,
    bitmap$   bigint[] default ARRAY [0]         not null,
    snaptime$ date     default clock_timestamp() not null,
    dmltype$  char(7)                            not null
);

create index log$_survey_response_bitmap$_key
    on log$_survey_response (bitmap$);

create table map_overlay
(
    code                     text                                 not null
        constraint "mapOverlay_id_key"
            unique,
    name                     text                                 not null,
    permission_group         text                                 not null,
    linked_measures          text[],
    config                   jsonb   default '{}'::jsonb          not null,
    country_codes            text[],
    project_codes            text[]  default '{}'::text[],
    report_code              text,
    legacy                   boolean default false                not null,
    data_services            jsonb   default '[{"isDataRegional": true}]'::jsonb,
    entity_attributes_filter jsonb   default '{}'::jsonb          not null
);

create table map_overlay_group
(
    id   text not null
        primary key,
    name text not null,
    code text not null
        unique
);

create table map_overlay_group_relation
(
    id                   text not null
        primary key,
    map_overlay_group_id text not null
        references map_overlay_group,
    child_id             text not null,
    child_type           text not null,
    sort_order           integer
);

create table meditrak_sync_queue
(
    id          text not null
        primary key,
    type        text not null,
    record_type text not null,
    record_id   text not null
        constraint meditrak_sync_queue_record_id_unique
            unique
);

create index meditrak_sync_queue_record_id_idx
    on meditrak_sync_queue (record_id);

create table migrations
(
    name   varchar(255)                                           not null,
    run_on timestamp                                              not null
);

create table ms1_sync_log
(
    id          text not null,
    record_type text not null,
    record_id   text not null
        constraint ms1_sync_log_record_id_unique
            unique,
    count       integer default 1,
    error_list  text,
    endpoint    text,
    data        text
);

create table ms1_sync_queue
(
    id                text not null,
    type              text not null,
    record_type       text not null,
    record_id         text not null
        constraint ms1_sync_queue_record_id_unique
            unique,
    priority          integer          default 1,
    details           text,
    is_dead_letter    boolean          default false,
    bad_request_count integer          default 0,
    is_deleted        boolean          default false
);

create table option_set
(
    id   text not null
        primary key,
    name text not null
        unique
);

create table option
(
    id            text not null
        primary key,
    value         text not null,
    label         text,
    sort_order    integer,
    option_set_id text not null
        constraint option_option_set_id_fk
            references option_set
            on update cascade on delete cascade,
    attributes    jsonb default '{}'::jsonb,
    constraint option_option_set_id_value_unique
        unique (option_set_id, value)
);

create table permission_group
(
    id        text not null
        primary key,
    name      text not null
        unique,
    parent_id text
        references permission_group
            on update cascade on delete restrict
);

create index permission_group_name_idx
    on permission_group (name);

create index permission_group_parent_id_idx
    on permission_group (parent_id);

create table project
(
    id                   text                                                    not null
        primary key,
    code                 text                                                    not null
        unique,
    description          text,
    sort_order           integer,
    image_url            text,
    default_measure      text   default '126,171'::text,
    dashboard_group_name text   default 'General'::text,
    permission_groups    text[] default '{}'::text[]                             not null,
    logo_url             text,
    entity_id            text,
    entity_hierarchy_id  text
        references entity_hierarchy,
    config               jsonb  default '{"permanentRegionLabels": true}'::jsonb not null
);

create table psss_session
(
    id                  text   not null
        primary key,
    email               text   not null,
    access_policy       jsonb  not null,
    access_token        text   not null,
    access_token_expiry bigint not null,
    refresh_token       text   not null
);

create table question
(
    id              text                            not null
        primary key,
    text            text                            not null,
    name            text,
    options         text[],
    code            text
        constraint question_code_unique
            unique,
    detail          text,
    option_set_id   varchar
        constraint question_option_set_id_fk
            references option_set
            on update restrict on delete restrict,
    hook            text,
    data_element_id text
        constraint question_data_source_id_fkey
            references data_element
);

create index question_code_idx
    on question (code);

create table report
(
    id                     text                      not null
        primary key,
    code                   text                      not null
        unique,
    config                 jsonb                     not null,
    permission_group_id    text                      not null
        references permission_group
            on update cascade on delete restrict,
    latest_data_parameters jsonb default '{}'::jsonb not null
);

create table setting
(
    id    text not null
        primary key,
    key   text not null
        unique,
    value text
);

create index setting_key_idx
    on setting (key);

create table survey_group
(
    id   text not null
        primary key,
    name text not null
        unique
);

create index survey_group_name_idx
    on survey_group (name);

create table sync_group_log
(
    id              text         not null
        constraint sync_service_log_pkey
            primary key,
    sync_group_code text         not null,
    log_message     text         not null,
    timestamp       timestamp default timezone('UTC'::text, now())
);

create table "userSession"
(
    id                  text             not null
        unique,
    "userName"          text             not null
        primary key,
    "accessToken"       text,
    "refreshToken"      text             not null,
    "accessPolicy"      jsonb,
    access_token_expiry bigint default 0 not null
);

create table user_account
(
    id               text                                         not null
        primary key,
    first_name       text,
    last_name        text,
    email            text                                         not null
        unique,
    gender           text,
    creation_date    timestamp with time zone default now(),
    employer         text,
    position         text,
    mobile_number    text,
    password_hash    text                                         not null,
    password_salt    text                                         not null,
    profile_image    text,
    preferences      jsonb                    default '{}'::jsonb not null
);

create table access_request
(
    id                  text                                   not null
        primary key,
    user_id             text
        references user_account,
    entity_id           text
        references entity,
    message             text,
    project_id          text
        references project,
    permission_group_id text
        references permission_group,
    approved            boolean,
    created_time        timestamp with time zone default now() not null,
    processed_by        text
        references user_account,
    note                text,
    processed_date      timestamp with time zone
);

create table api_client
(
    id              text not null
        primary key,
    username        text not null
        unique,
    secret_key_hash text not null,
    user_account_id text
        references user_account
);

create table api_request_log
(
    id            text             not null
        primary key,
    version       double precision not null,
    endpoint      text             not null,
    user_id       text
        references user_account
            on update cascade on delete cascade,
    request_time  timestamp default now(),
    query         jsonb,
    metadata      jsonb     default '{}'::jsonb,
    refresh_token text,
    api           text             not null,
    method        text
);

create table comment
(
    id                 text                                   not null
        primary key,
    user_id            text
        references user_account,
    created_time       timestamp with time zone default now() not null,
    last_modified_time timestamp with time zone default now() not null,
    text               text                                   not null
);

create table error_log
(
    id                 text not null
        primary key,
    message            text,
    api_request_log_id text
        references api_request_log
            on update cascade on delete cascade,
    type               text,
    error_time         timestamp default now()
);

create table feed_item
(
    id                   text not null
        primary key,
    country_id           text
        constraint feed_item_country_fk
            references country
            on update cascade on delete cascade,
    geographical_area_id text
        constraint feed_item_geographical_area_fk
            references geographical_area
            on update cascade on delete cascade,
    user_id              text
        constraint feed_item_user_fk
            references user_account
            on update cascade on delete cascade,
    permission_group_id  text
        constraint feed_item_permission_group_fk
            references permission_group
            on update cascade on delete cascade,
    type                 text,
    record_id            text,
    template_variables   json,
    creation_date        timestamp default now()
);

create table meditrak_device
(
    id          text not null
        constraint install_id_pkey
            primary key,
    user_id     text not null
        constraint install_id_user_account_id_fk
            references user_account
            on update restrict on delete cascade,
    install_id  text not null
        constraint meditrak_device_install_id_unique
            unique,
    platform    varchar default ''::character varying,
    app_version text,
    config      jsonb   default '{}'::jsonb,
    last_login  timestamp
);

create table one_time_login
(
    id            text not null
        primary key,
    user_id       text not null
        constraint one_time_logins_user_id_users_id_fk
            references user_account
            on update cascade on delete cascade,
    token         text not null
        unique,
    creation_date timestamp with time zone default now(),
    use_date      timestamp with time zone
);

create table refresh_token
(
    id                 text not null
        primary key,
    user_id            text not null
        references user_account
            on update cascade on delete cascade,
    device             text,
    token              text not null,
    expiry             double precision,
    meditrak_device_id text
        constraint refresh_token_meditrak_device_id_fk
            references meditrak_device
            on update cascade on delete cascade,
    constraint refresh_token_user_id_device_unique
        unique (user_id, device)
);

create index refresh_token_token_idx
    on refresh_token (token);

create index refresh_token_user_id_idx
    on refresh_token (user_id);

create index user_account_creation_date_idx
    on user_account (creation_date);

create index user_account_email_idx
    on user_account (email);

create index user_account_first_name_idx
    on user_account (first_name);

create index user_account_last_name_idx
    on user_account (last_name);

create table user_entity_permission
(
    id                  text not null
        primary key,
    user_id             text not null
        references user_account
            on update cascade on delete cascade,
    entity_id           text not null
        references entity
            on update cascade on delete cascade,
    permission_group_id text not null
        references permission_group
            on update cascade on delete cascade
);

create index user_entity_permission_entity_id_idx
    on user_entity_permission (entity_id);

create index user_entity_permission_permission_group_id_idx
    on user_entity_permission (permission_group_id);

create index user_entity_permission_user_id_idx
    on user_entity_permission (user_id);

create table data_group
(
    id           text                      not null
        primary key,
    code         text                      not null,
    config       jsonb default '{}'::jsonb not null
);

create table data_element_data_group
(
    id              text not null
        primary key,
    data_element_id text not null
        constraint data_element_data_group_data_element_id_fk
            references data_element
            on update cascade on delete cascade,
    data_group_id   text not null
        references data_group
            on update cascade on delete cascade,
    constraint data_element_data_group_unique
        unique (data_element_id, data_group_id)
);

create table survey
(
    id                   text                               not null
        primary key,
    name                 text                               not null
        unique,
    code                 varchar(30)                        not null
        constraint survey_code_unique
            unique,
    country_ids          text[]  default '{}'::text[],
    can_repeat           boolean default false,
    survey_group_id      text
                                                            references survey_group
                                                                on update cascade on delete set null,
    integration_metadata jsonb   default '{}'::jsonb,
    requires_approval    boolean default false,
    data_group_id        text
                                                            references data_group
                                                                on update cascade on delete set null
);

create index survey_name_idx
    on survey (name);

create index survey_survey_group_id_idx
    on survey (survey_group_id);

create index survey_code_idx
    on survey (code);

create table survey_response
(
    id              text                                       not null
        primary key,
    survey_id       text                                       not null
        references survey
            on update cascade on delete restrict,
    user_id         text                                       not null
        references user_account
            on update cascade on delete restrict,
    assessor_name   text                                       not null,
    start_time      timestamp with time zone                   not null,
    end_time        timestamp with time zone                   not null,
    metadata        text,
    timezone        text            default 'Pacific/Auckland'::text,
    entity_id       text                                       not null
        references entity
            on update cascade,
    data_time       timestamp,
    outdated        boolean         default false
);

create table answer
(
    id                 text                            not null
        primary key,
    type               text                            not null,
    survey_response_id text                            not null
        references survey_response
            on update cascade on delete cascade,
    question_id        text                            not null
        references question,
    text               text,
    constraint answer_survey_response_id_question_id_unique
        unique (survey_response_id, question_id)
);

create index answer_question_id_idx
    on answer (question_id);

create index answer_survey_response_id_idx
    on answer (survey_response_id);

create index answer_type_idx
    on answer (type);

create index survey_response_end_time_idx
    on survey_response (end_time);

create index survey_response_start_time_idx
    on survey_response (start_time);

create index survey_response_survey_id_idx
    on survey_response (survey_id);

create index survey_response_user_id_idx
    on survey_response (user_id);

create index survey_response_entity_id_idx
    on survey_response (entity_id);

create index survey_response_outdated_id_idx
    on survey_response (outdated);

create index survey_response_data_time_idx
    on survey_response (data_time desc);

create table survey_response_comment
(
    id                 text not null
        primary key,
    survey_response_id text not null
        references survey_response
            on update cascade on delete cascade,
    comment_id         text not null
        references comment
            on update cascade on delete cascade
);

create table survey_screen
(
    id            text             not null
        primary key,
    survey_id     text             not null
        references survey
            on update cascade on delete cascade,
    screen_number double precision not null
);

create index survey_screen_screen_number_idx
    on survey_screen (screen_number);

create index survey_screen_survey_id_idx
    on survey_screen (survey_id);

create table survey_screen_component
(
    id                         text             not null
        primary key,
    question_id                text             not null
        references question
            on update cascade on delete restrict,
    screen_id                  text             not null
        references survey_screen
            on update cascade on delete cascade,
    component_number           double precision not null,
    answers_enabling_follow_up text[]  default '{}'::text[],
    is_follow_up               boolean default false,
    visibility_criteria        varchar,
    validation_criteria        varchar,
    question_label             text,
    detail_label               text,
    config                     varchar default '{}'::character varying
);

create index survey_screen_component_component_number_idx
    on survey_screen_component (component_number);

create index survey_screen_component_question_id_idx
    on survey_screen_component (question_id);

create index survey_screen_component_screen_id_idx
    on survey_screen_component (screen_id);

create table dhis_instance
(
    id       text    not null
        primary key,
    code     text    not null
        unique,
    readonly boolean not null,
    config   jsonb   not null
);

create table superset_instance
(
    id     text  not null
        primary key,
    code   text  not null
        unique,
    config jsonb not null
);

create table data_element_data_service
(
    id                text                      not null
        primary key,
    data_element_code text                      not null,
    country_code      text                      not null,
    service_config    jsonb default '{}'::jsonb not null
);

create table user_favourite_dashboard_item
(
    id                text not null
        primary key,
    user_id           text not null
        references user_account
            on update cascade on delete cascade,
    dashboard_item_id text not null
        references dashboard_item
            on update cascade on delete cascade,
    unique (user_id, dashboard_item_id)
);

create index user_favourite_dashboard_item_user_id_idx
    on user_favourite_dashboard_item (user_id);

create table data_table
(
    id                text                      not null
        primary key,
    code              text                      not null
        unique,
    description       text,
    config            jsonb default '{}'::jsonb not null,
    permission_groups text[]                    not null
);

create table analytics
(
    entity_code            varchar(64),
    entity_name            varchar(128),
    data_element_code      text,
    data_group_code        varchar(30),
    event_id               text,
    value                  text,
    type                   text,
    day_period             text,
    week_period            text,
    month_period           text,
    year_period            text,
    date                   timestamp,
    survey_response_m_row$ uuid,
    answer_m_row$          uuid,
    entity_m_row$          uuid,
    answer_entity_m_row$   uuid,
    survey_m_row$          uuid,
    question_m_row$        uuid,
    data_element_m_row$    uuid
);

create index analytics_survey_response_m_row$_key
    on analytics (survey_response_m_row$);

create index analytics_answer_m_row$_key
    on analytics (answer_m_row$);

create index analytics_entity_m_row$_key
    on analytics (entity_m_row$);

create index analytics_answer_entity_m_row$_key
    on analytics (answer_entity_m_row$);

create index analytics_survey_m_row$_key
    on analytics (survey_m_row$);

create index analytics_question_m_row$_key
    on analytics (question_m_row$);

create index analytics_data_element_m_row$_key
    on analytics (data_element_m_row$);

create index analytics_data_element_entity_date_idx
    on analytics (data_element_code asc, entity_code asc, date desc);

create index analytics_data_group_entity_event_date_idx
    on analytics (data_group_code asc, entity_code asc, event_id asc, date desc);

create table external_database_connection
(
    id                text                        not null
        primary key,
    code              text                        not null
        unique,
    name              text                        not null,
    description       text,
    permission_groups text[] default '{}'::text[] not null
);

create table landing_page
(
    id                     text        not null
        primary key,
    name                   varchar(40) not null,
    url_segment            text        not null,
    image_url              text,
    logo_url               text,
    primary_hexcode        text,
    secondary_hexcode      text,
    extended_title         text,
    long_bio               text,
    contact_us             text,
    external_link          text,
    phone_number           text,
    website_url            text,
    include_name_in_header boolean,
    project_codes          text[]
);

create table tupaia_web_session
(
    id                  text   not null
        primary key,
    email               text   not null,
    access_policy       jsonb  not null,
    access_token        text   not null,
    access_token_expiry bigint not null,
    refresh_token       text   not null
);

create table datatrak_session
(
    id                  text   not null
        primary key,
    email               text   not null,
    access_policy       jsonb  not null,
    access_token        text   not null,
    access_token_expiry bigint not null,
    refresh_token       text   not null
);

create table dashboard_mailing_list
(
    id                      text                        not null
        primary key,
    project_id              text                        not null
        constraint dashboard_mailing_list_project_id_fk
            references project
            on update cascade on delete cascade,
    entity_id               text                        not null
        constraint dashboard_mailing_list_entity_id_fk
            references entity
            on update cascade on delete cascade,
    dashboard_id            text                        not null
        constraint dashboard_mailing_list_dashboard_id_fk
            references dashboard
            on update cascade on delete cascade,
    admin_permission_groups text[] default '{}'::text[] not null,
    constraint dashboard_id_project_id_entity_id_unique
        unique (dashboard_id, project_id, entity_id)
);

create table dashboard_mailing_list_entry
(
    id                        text                 not null
        primary key,
    dashboard_mailing_list_id text                 not null
        constraint dashboard_mailing_list_entry_dashboard_mailing_list_id_fk
            references dashboard_mailing_list
            on update cascade on delete cascade,
    email                     text                 not null,
    subscribed                boolean default true not null,
    unsubscribed_time         timestamp,
    constraint dashboard_mailing_list_id_email_unique
        unique (dashboard_mailing_list_id, email)
);

create table task
(
    id                 text                    not null
        primary key,
    survey_id          text                    not null
        constraint task_survey_id_fk
            references survey
            on update cascade on delete cascade,
    entity_id          text                    not null
        constraint task_entity_id_fk
            references entity
            on update cascade on delete cascade,
    assignee_id        text
        constraint task_assignee_id_fk
            references user_account,
    repeat_schedule    jsonb,
    created_at         timestamp default now() not null,
    survey_response_id text
        constraint task_survey_response_id_fk
            references survey_response
            on update cascade on delete set null,
    initial_request_id text
        constraint task_initial_request_id_fk
            references survey_response
            on update cascade on delete set null,
    due_date           double precision,
    parent_task_id     text
        constraint task_parent_task_id_fk
            references task
            on update cascade on delete set null,
    overdue_email_sent timestamp with time zone
);

create index task_survey_id_idx
    on task (survey_id);

create index task_entity_id_idx
    on task (entity_id);

create index task_assignee_id_idx
    on task (assignee_id);

create index task_survey_response_id_idx
    on task (survey_response_id);

create index task_initial_request_id_fk
    on task (survey_response_id);

create index task_parent_task_id_fk
    on task (parent_task_id);

create table task_comment
(
    id                 text                                                       not null
        primary key,
    task_id            text                                                       not null
        constraint task_task_id_fk
            references task
            on update cascade on delete cascade,
    user_id            text
        constraint task_user_id_fk
            references user_account
            on update set null on delete set null,
    user_name          text                                                       not null,
    message            text,
    created_at         timestamp with time zone default now()                     not null,
    template_variables jsonb                    default '{}'::jsonb               not null
);

create index task_comment_task_id_idx
    on task_comment (task_id);

create index task_comment_user_id_idx
    on task_comment (user_id);

create table user_country_access_attempt
(
    id           text not null
        primary key,
    user_id      text not null
        constraint user_country_access_user_id_fk
            references user_account
            on update cascade on delete cascade,
    country_code text not null
);

create index user_country_access_attempt_user_id_idx
    on user_country_access_attempt (user_id);

create index user_country_access_attempt_country_code_idx
    on user_country_access_attempt (country_code);

create table login_attempts
(
    key    varchar(255)      not null
        primary key,
    points integer default 0 not null,
    expire bigint
);

INSERT INTO user_account (
    id, 
    first_name, 
    last_name, 
    email,
    gender, 
    creation_date, 
    employer, 
    position,
    mobile_number,
    password_hash, 
    password_salt
) VALUES (
    '5f42f7d361f76a559504c0f0'::text, 
    'Stephen'::text, 
    'Clarke'::text, 
    'systems@flexis.com.au'::text, 
    null::text, 
    '2020-08-23 23:12:19.298000 +00:00'::timestamp with time zone, 
    'Flexis'::text, 
    'MD'::text, 
    null::text, 
    '97e1182a1d6122f5f7bfd8774a1a75446cdee7cd9dd74362ad9104eabffb4a8a'::text, 
    'bMYZzVfO5mVJ55iFScejIA=='::text
);

INSERT INTO survey (
    id, 
    name, 
    code, 
    country_ids, 
    can_repeat, 
    integration_metadata, 
    requires_approval
) VALUES (
    '62b015be60209041ec00281a'::text, 
    'HD01 Hemodialysis Ward Report'::text, 
    'PW_HD01'::varchar(30), 
    '{5e38b60f61f76a05ff1ade80}', 
    false::boolean, 
    '{}'::jsonb, 
    false::boolean
);

INSERT INTO entity (
    id,
    code, 
    name, 
    image_url, 
    country_code,
    metadata, 
    attributes
) VALUES (
    '62f17d3b32886b81ec90ee4d'::varchar(64), 
    'LID-ZD9-EKZ'::varchar(64), 
    'LID-ZD9-EKZ'::varchar(128), 
    null::text, 
    'TO'::varchar(6), 
    '{"dhis": {"trackedEntityId": "T66rrLISpbT"}}'::jsonb, 
    '{}'::jsonb
);
`;