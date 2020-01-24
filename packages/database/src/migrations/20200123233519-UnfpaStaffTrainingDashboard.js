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
    'UNFPA_Staff_Trained_Matrix',
    'tableOfEvents',
    '{"columns": {
      "RHS4UNFPA809": {}, "RHS3UNFPA5410": {}, "RHS2UNFPA291": {}, "RHS2UNFPA292": {}, "RHS2UNFPA240": {}, 
      "$eventOrgUnitName": {"title": "Village", "sortOrder": 1}}}	',
    '{"name": "Staff Trained Matrix", "type": "matrix", "placeholder": "/static/media/PEHSMatrixPlaceholder.png"}'
    );

    UPDATE "dashboardGroup"
      SET "dashboardReports" = "dashboardReports" || '{UNFPA_Staff_Trained_Matrix}'
        WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';

  `);
};

exports.down = function(db) {
  return db.runSql(`
    delete from "dashboardReport" where id = 'UNFPA_Staff_Trained_Matrix';
    update "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", 'UNFPA_Staff_Trained_Matrix')
      WHERE "userGroup" = 'UNFPA' AND "organisationLevel" = 'Facility';
`);
};

exports._meta = {
  version: 1,
};
