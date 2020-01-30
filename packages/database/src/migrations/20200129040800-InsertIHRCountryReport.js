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
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
      VALUES (
        'WHO_IHR_Reports',
        'matrixOfValuesForOrgUnits',
        '{
          "columns": [{ "code": 'TO', "key": 'TO' }],
          "rows": [{ "dataElement": 'BCD1' }]
        }',
        '{}'
      );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
