'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const addEqualColumnReportCodeConstraint = db => {
  return db.runSql(`
    ALTER TABLE dashboard_item
    ADD CONSTRAINT check_code_equals_report_code
    CHECK (legacy = true OR code = report_code);
  `);
};

// update any existing dashboard items where the code is not the same as the report code (should not happen but just in case)
const updateDashboardItemCode = db => {
  return db.runSql(`
  UPDATE dashboard_item
  SET code = report_code
  WHERE code <> report_code AND legacy != true;
`);
};

exports.up = async function (db) {
  await updateDashboardItemCode(db);
  await addEqualColumnReportCodeConstraint(db);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE dashboard_item
    DROP CONSTRAINT check_code_equals_report_code;
  `);
};

exports._meta = {
  version: 1,
};
