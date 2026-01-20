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

const CODE_TO_NEW_TITLE = {
  LESMIS_gross_intake_ratio_primary_province_summary:
    'Gross Intake Ratio to the Last Grade of Primary Education, by District',
  LESMIS_gross_intake_ratio_lower_secondary_province_summary:
    'Gross Intake Ratio to the Last Grade of LSE, by District',
  LESMIS_gross_intake_ratio_upper_secondary_province_summary:
    'Gross Intake Ratio to the Last Grade of USE, by District',
};
const CODE_TO_OLD_TITLE = {
  LESMIS_gross_intake_ratio_primary_province_summary:
    'Gross Intake Ratio to the Last Grade of Primary Education',
  LESMIS_gross_intake_ratio_lower_secondary_province_summary:
    'Gross Intake Ratio to the Last Grade of Primary Education',
  LESMIS_gross_intake_ratio_upper_secondary_province_summary:
    'Gross Intake Ratio to the Last Grade of Primary Education',
};

const updateDashboardItemTitle = async (db, code, newTitle) =>
  db.runSql(`
  UPDATE dashboard_item
  SET config = config || '{"name": "${newTitle}" }'
  WHERE code = '${code}'
`);

exports.up = async function (db) {
  for (const [code, title] of Object.entries(CODE_TO_NEW_TITLE)) {
    await updateDashboardItemTitle(db, code, title);
  }
};

exports.down = async function (db) {
  for (const [code, title] of Object.entries(CODE_TO_OLD_TITLE)) {
    await updateDashboardItemTitle(db, code, title);
  }
};

exports._meta = {
  version: 1,
};
