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
  INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson") VALUES (
    'UNFPA_RH_Stock_Cards_metrics',
    'evaluateAllTrue',
    '{ "dataClasses": {"UNFPA: Does this Facility use Stock Cards": {"dataValues": ["RHS6UNFPA1210","RHS6UNFPA1223","RHS6UNFPA1236","RHS6UNFPA1249","RHS6UNFPA1262","RHS6UNFPA1301"]},
                       "UNFPA: Are all RH commodity stock cards up to date": {"dataValues": ["RHS6UNFPA1302","RHS6UNFPA1263","RHS6UNFPA1250","RHS6UNFPA1237","RHS6UNFPA1224","RHS6UNFPA1211"]}}}',
    '{"name": "RH Stock Card", "type": "view", "viewType": "multiValue", "valueType": "boolean"}'
    );

    UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{UNFPA_RH_Stock_Cards_metrics}'
        WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';

  `);
};

exports.down = function(db) {
  return db.runSql(`
    delete from "dashboardReport" where id = 'UNFPA_RH_Stock_Cards_metrics';
    update "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_RH_Stock_Cards_metrics')
      WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';
  `);
};

exports._meta = {
  version: 1,
};
