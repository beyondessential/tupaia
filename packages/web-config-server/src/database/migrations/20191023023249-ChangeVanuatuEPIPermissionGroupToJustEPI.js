'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE permission_group
      SET name = 'EPI'
      WHERE name = 'Vanuatu EPI';

    UPDATE "dashboardGroup"
      SET "userGroup" = 'EPI'
      WHERE "userGroup" = 'Vanuatu EPI';

    UPDATE "mapOverlay"
      SET "userGroup" = 'EPI'
      WHERE "userGroup" = 'Vanuatu EPI';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE permission_group
      SET name = 'Vanuatu EPI'
      WHERE name = 'EPI';

    UPDATE "dashboardGroup"
      SET "userGroup" = 'Vanuatu EPI'
      WHERE "userGroup" = 'EPI';

    UPDATE "mapOverlay"
      SET "userGroup" = 'Vanuatu EPI'
      WHERE "userGroup" = 'EPI';
  `);
};

exports._meta = {
  version: 1,
};
