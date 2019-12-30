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
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson", "dataServices")
    VALUES (
      'TO_Villages_Serviced_By_Facility',
      'villagesServicedByFacility',
      '{}',
      '{"name": "Villages serviced by this facility", "type": "view", "viewType": "multiSingleValue", "valueType": "text"}',
      '[{ "isDataRegional": false }]'
    );

    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name", "code"
    ) VALUES (
      'Facility', 'Public', 'TO', '{"TO_Villages_Serviced_By_Facility"}', 'Serviced Villages', 'Tonga_Serviced_Villages'
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
