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
  return db.runSql(
    `INSERT INTO "dashboardGroup" (
    "organisationLevel",
    "userGroup",
    "organisationUnitCode",
    "name",
    "code"
    )
    VALUES (
    'Province',
    'Public',
    'AU',
    'COVID-19',
    'AU_Covid_Province'
    ),
    (
      'Country',
      'Public',
      'AU',
      'COVID-19',
      'AU_Covid_National'
    );`,
  );
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardGroup" 
    WHERE "code" = 'Covid_Aus_general_state' 
    OR "code" = 'Covid_Aus_general_national';
  `);
};

exports._meta = {
  version: 1,
};
