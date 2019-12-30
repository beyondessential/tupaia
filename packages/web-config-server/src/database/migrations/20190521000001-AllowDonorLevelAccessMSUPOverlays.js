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
    UPDATE "mapOverlay"
    SET "userGroup" = 'Donor'
    WHERE "groupName" = 'Déploiement du mSupply' AND "userGroup" = 'Admin';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "userGroup" = 'Admin'
    WHERE "groupName" = 'Déploiement du mSupply' AND "userGroup" = 'Donor';
  `);
};

exports._meta = {
  version: 1,
};
