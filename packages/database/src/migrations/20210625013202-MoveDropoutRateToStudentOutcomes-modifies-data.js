'use strict';

const { arrayToDbString } = require('../utilities');

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

const OLD_CODES = [
  'Laos_Schools_Dropout_Bar_Primary_District',
  'Laos_Schools_Dropout_Bar_Lower_Secondary_District',
  'Laos_Schools_Dropout_Bar_Upper_Secondary_District',
];

const NEW_CODES = [
  'LESMIS_dropout_rate_by_grade_primary',
  'LESMIS_dropout_rate_by_grade_upper_secondary',
  'LESMIS_dropout_rate_by_grade_lower_secondary',
];

const CORRECT_DASHBOARD_CODE = 'LA_Student_Outcomes';

exports.up = async function (db) {
  // delete old dashboard reports that were created for Laos Schools
  await db.runSql(`DELETE FROM dashboard_item WHERE code IN (${arrayToDbString(OLD_CODES)});`); // deletes cascade to dashboard_relation

  // move the new ones to the correct dashboard
  await db.runSql(`
      UPDATE dashboard_relation
      SET dashboard_id = (SELECT id FROM dashboard WHERE code = '${CORRECT_DASHBOARD_CODE}')
      WHERE child_id IN (SELECT id FROM dashboard_item WHERE code IN (${arrayToDbString(
        NEW_CODES,
      )}))
    `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
