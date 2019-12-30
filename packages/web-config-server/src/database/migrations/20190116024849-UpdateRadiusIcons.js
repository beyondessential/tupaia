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

const makeRadiusIconJSON = noun =>
  JSON.stringify([
    { icon: 'hidden', name: `Has ${noun}`, value: 'other', color: 'blue' },
    { icon: 'x', name: `No ${noun}`, value: 0, color: 'grey' },
  ]);

exports.up = function(db) {
  return db.runSql(`
    UPDATE "mapOverlay"
      SET "values" = '${makeRadiusIconJSON('beds')}', "displayType" = 'icon'
      WHERE "name" = 'Inpatient beds coloring';

    UPDATE "mapOverlay"
      SET "values" = '${makeRadiusIconJSON('tablets')}', "displayType" = 'icon'
      WHERE "name" = 'Water purification coloring';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
