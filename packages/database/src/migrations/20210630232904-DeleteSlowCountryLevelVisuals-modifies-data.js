'use strict';

import { arrayToDbString } from '../utilities';

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

const SLOW_NATIONAL_DASHBOARD_ITEMS = [
  'LESMIS_age_of_grade1_entrance',
  'LESMIS_student_gender_stacked_gpi',
];

const setEntityTypesForDashboardItems = (db, entityTypes, dashboardItems) =>
  db.runSql(`
    UPDATE dashboard_relation
    SET entity_types = '${entityTypes}'
    WHERE child_id IN (
      SELECT id FROM dashboard_item
      WHERE code IN (${arrayToDbString(dashboardItems)})
    );
`);

exports.up = function (db) {
  return setEntityTypesForDashboardItems(
    db,
    '{district,sub_district}',
    SLOW_NATIONAL_DASHBOARD_ITEMS,
  );
};

exports.down = function (db) {
  return setEntityTypesForDashboardItems(
    db,
    '{country,district,sub_district}',
    SLOW_NATIONAL_DASHBOARD_ITEMS,
  );
};

exports._meta = {
  version: 1,
};
