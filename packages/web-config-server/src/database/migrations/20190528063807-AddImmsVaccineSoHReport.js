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
    INSERT INTO "dashboardReport" (
      "id", "dataBuilder", "dataBuilderConfig", "viewJson"
    ) VALUES (
      'Imms_FridgeVaccineCount',
      'singleColumnTable', 
      '{"columnTitle": "Stock Count", "dataElementCodes": ["QTY_375874bf","QTY_44ec84bf","QTY_7191781d","QTY_6fc9d81d","QTY_cd2d581d","QTY_4e6a681d","QTY_40a8681d","QTY_452a74bf"]}',
      '{"name": "Current Vaccines Stock on Hand", "type": "chart", "chartType": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png"}'
    );

    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name"
    ) VALUES (
      'Country',
      'Vanuatu EPI',
      'VU',
      '{"Imms_FridgeVaccineCount"}',
      'Immunisation'
    );

    INSERT INTO "dashboardGroup" (
      "organisationLevel", "userGroup", "organisationUnitCode", "dashboardReports", "name"
    ) VALUES (
      'Province',
      'Vanuatu EPI',
      'VU',
      '{"Imms_FridgeVaccineCount"}',
      'Immunisation'
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
