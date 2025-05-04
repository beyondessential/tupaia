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

const OLD_ENTITY_TYPES = '{country,district,sub_district}';
const NEW_ENTITY_TYPES = '{district,sub_district}';

const setEntityTypesForDashboardItems = (db, oldEntityTypes, newEntityTypes, dashboardItems) =>
  db.runSql(`
    UPDATE dashboard_relation
    SET entity_types = '${newEntityTypes}'
    WHERE child_id IN (
      SELECT id FROM dashboard_item
      WHERE code IN (${arrayToDbString(dashboardItems)})
    ) AND entity_types = '${oldEntityTypes}';
`);

exports.up = function (db) {
  return setEntityTypesForDashboardItems(
    db,
    OLD_ENTITY_TYPES,
    NEW_ENTITY_TYPES,
    SLOW_NATIONAL_DASHBOARD_ITEMS,
  );
};

exports.down = function (db) {
  return setEntityTypesForDashboardItems(
    db,
    NEW_ENTITY_TYPES,
    OLD_ENTITY_TYPES,
    SLOW_NATIONAL_DASHBOARD_ITEMS,
  );
};

exports._meta = {
  version: 1,
};
