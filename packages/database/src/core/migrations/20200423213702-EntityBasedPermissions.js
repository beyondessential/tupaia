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
  return db.runSql(`
    CREATE TABLE user_entity_permission (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      entity_id TEXT,
      permission_group_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user_account (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (entity_id) REFERENCES entity (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (permission_group_id) REFERENCES permission_group (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    -- Note that these inserts won't send out emails to users, as user_entity_permission is a new table,
    -- so the change notification trigger won't exist until this set of migrations is completed
    INSERT INTO user_entity_permission (id, user_id, entity_id, permission_group_id)
    SELECT user_country_permission.id, user_country_permission.user_id, entity.id, user_country_permission.permission_group_id
    FROM user_country_permission
    JOIN country ON user_country_permission.country_id = country.id
    JOIN entity ON country.code = entity.code;

    CREATE INDEX user_entity_permission_user_id_idx ON user_entity_permission USING btree (user_id);
    CREATE INDEX user_entity_permission_entity_id_idx ON user_entity_permission USING btree (entity_id);
    CREATE INDEX user_entity_permission_permission_group_id_idx ON user_entity_permission USING btree (permission_group_id);

    DROP TABLE user_country_permission;
    DROP TABLE user_clinic_permission;
    DROP TABLE user_geographical_area_permission;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    CREATE TABLE user_country_permission (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      country_id TEXT,
      permission_group_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user_account (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (country_id) REFERENCES country (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (permission_group_id) REFERENCES permission_group (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE TABLE user_clinic_permission (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      clinic_id TEXT,
      permission_group_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user_account (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (clinic_id) REFERENCES clinic (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (permission_group_id) REFERENCES permission_group (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE INDEX user_clinic_permission_user_id_idx ON user_clinic_permission USING btree (user_id);
    CREATE INDEX user_clinic_permission_clinic_id_idx ON user_clinic_permission USING btree (clinic_id);
    CREATE INDEX user_clinic_permission_permission_group_id_idx ON user_clinic_permission USING btree (permission_group_id);

    CREATE TABLE user_geographical_area_permission (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT,
      geographical_area_id TEXT,
      permission_group_id TEXT,
      FOREIGN KEY (user_id) REFERENCES user_account (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (geographical_area_id) REFERENCES geographical_area (id) ON UPDATE CASCADE ON DELETE CASCADE,
      FOREIGN KEY (permission_group_id) REFERENCES permission_group (id) ON UPDATE CASCADE ON DELETE CASCADE
    );

    CREATE INDEX user_geographical_area_permission_user_id_idx ON user_geographical_area_permission USING btree (user_id);
    CREATE INDEX user_geographical_area_permission_geographical_area_id_idx ON user_geographical_area_permission USING btree (geographical_area_id);
    CREATE INDEX user_geographical_area_permission_permission_group_id_idx ON user_geographical_area_permission USING btree (permission_group_id);

    INSERT INTO user_country_permission (id, user_id, country_id, permission_group_id)
    SELECT user_entity_permission.id, user_entity_permission.user_id, country.id, user_entity_permission.permission_group_id
    FROM user_entity_permission
    JOIN entity ON user_entity_permission.entity_id = entity.id
    JOIN country ON entity.code = country.code;

    CREATE INDEX user_country_permission_user_id_idx ON user_country_permission USING btree (user_id);
    CREATE INDEX user_country_permission_country_id_idx ON user_country_permission USING btree (country_id);
    CREATE INDEX user_country_permission_permission_group_id_idx ON user_country_permission USING btree (permission_group_id);

    DROP TABLE user_entity_permission;
  `);
};

exports._meta = {
  version: 1,
};
