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
  return db.runSql(
    `
      CREATE TABLE entity_parent_child_relation
      (
          id                   TEXT             NOT NULL PRIMARY KEY,
          parent_id            TEXT             NOT NULL REFERENCES entity
            on update cascade on delete cascade,
          child_id             TEXT             NOT NULL REFERENCES entity
            on update cascade on delete cascade,
          entity_hierarchy_id  TEXT             NOT NULL REFERENCES entity_hierarchy
            on update cascade on delete cascade,
          UNIQUE(entity_hierarchy_id, parent_id, child_id)
      );
    `,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
