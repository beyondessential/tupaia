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

const updateDashboardItemTitle = async (db, code, newTitle) =>
  db.runSql(`
  UPDATE dashboard_item
  SET config = config || '{"name": "${newTitle}" }'
  WHERE code = '${code}'
`);

exports.up = function (db) {
  return updateDashboardItemTitle(
    db,
    'LESMIS_cohort_survival_rate_primary_district',
    'Primary School Cohort Survival Rates (by grade and gender)',
  );
};

exports.down = function (db) {
  return updateDashboardItemTitle(
    db,
    'LESMIS_cohort_survival_rate_primary_district',
    'Primary Schoole Cohort Survival Rates (by grade and gender)',
  );
};

exports._meta = {
  version: 1,
};
