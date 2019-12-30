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
    UPDATE "dashboardGroup" SET "code" = 'VU_Imms_Country' WHERE "name" = 'Immunisation' AND "organisationLevel" = 'Country';
    UPDATE "dashboardGroup" SET "code" = 'VU_Imms_Province' WHERE "name" = 'Immunisation' AND "organisationLevel" = 'Province';
    UPDATE "dashboardGroup" SET "code" = 'VU_Imms_Facility' WHERE "name" = 'Immunisation' AND "organisationLevel" = 'Facility';
  `);
};

exports.down = function(db) {
  return db.runSql(`UPDATE "dashboardGroup" SET "code" = NULL WHERE "id" in ('51', '52', '53')`);
};

exports._meta = {
  version: 1,
};
