'use strict';

import { codeToId, generateId, insertObject } from '../utilities';

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

const SCHOOLS_DASHBOARD_CODE = 'LESMIS_International_SDGs_students';

// Gross Intake Rate (GIR)
const GIR_DASHBOARD_CODE = 'LESMIS_International_SDGs_GIR';

// Percentage of Children Over Age (COA)
const COA_DASHBOARD_CODE = 'LESMIS_International_SDGs_COA';

const GIR_DASHBOARDS = [
  'LESMIS_gross_intake_ratio_primary_district',
  'LESMIS_gross_intake_ratio_lower_secondary_district',
  'LESMIS_gross_intake_ratio_upper_secondary_district',
  'LESMIS_gross_intake_ratio_primary_province',
  'LESMIS_gross_intake_ratio_lower_secondary_province',
  'LESMIS_gross_intake_ratio_upper_secondary_province',
  'LESMIS_gross_intake_ratio_primary_country',
  'LESMIS_gross_intake_ratio_lower_secondary_country',
  'LESMIS_gross_intake_ratio_upper_secondary_country',
  'LESMIS_gross_intake_ratio_primary_province_summary',
  'LESMIS_gross_intake_ratio_lower_secondary_province_summary',
  'LESMIS_gross_intake_ratio_upper_secondary_province_summary',
];

const COA_DASHBOARDS = [
  'LESMIS_percent_children_over_age_pe',
  'LESMIS_percent_children_over_age_lse',
  'LESMIS_province_pe_children_over_age',
  'LESMIS_province_lse_children_over_age',
  'LESMIS_country_pe_children_over_age',
  'LESMIS_country_lse_children_over_age',
];

const updateDashboardRelation = async (db, oldCode, parentCode, childCode) => {
  const oldId = await codeToId(db, 'dashboard', oldCode);
  const parentId = await codeToId(db, 'dashboard', parentCode);
  const childId = await codeToId(db, 'dashboard_item', childCode);

  return db.runSql(`
    UPDATE dashboard_relation SET dashboard_id = '${parentId}'
    WHERE dashboard_id = '${oldId}' and child_id = '${childId}';
  `);
};

const addDashboard = (db, name, code) => {
  return insertObject(db, 'dashboard', {
    id: generateId(),
    root_entity_code: 'LA',
    name,
    code,
  });
};

const removeDashboard = async (db, code) => {
  return db.runSql(`
    DELETE FROM "dashboard" WHERE "code" = '${code}';
  `);
};

exports.up = async function (db) {
  // create new dashboards
  await addDashboard(db, '4.1.3 Gross Intake Ratio', GIR_DASHBOARD_CODE);
  await addDashboard(db, '4.1.6 Percentage of Children Over-Age', COA_DASHBOARD_CODE);

  // update GIR dashboard relations
  for (const code of GIR_DASHBOARDS) {
    await updateDashboardRelation(db, SCHOOLS_DASHBOARD_CODE, GIR_DASHBOARD_CODE, code);
  }

  // update COA dashboard relations
  for (const code of COA_DASHBOARDS) {
    await updateDashboardRelation(db, SCHOOLS_DASHBOARD_CODE, COA_DASHBOARD_CODE, code);
  }

  // delete old dashboard
  await db.runSql(`
      delete from dashboard
      where code = '${SCHOOLS_DASHBOARD_CODE}';
  `);

  return null;
};

exports.down = async function (db) {
  await addDashboard(db, 'Students', SCHOOLS_DASHBOARD_CODE);

  // update GIR dashboard relations
  for (const code of GIR_DASHBOARDS) {
    await updateDashboardRelation(db, GIR_DASHBOARD_CODE, SCHOOLS_DASHBOARD_CODE, code);
  }

  // update COA dashboard relations
  for (const code of COA_DASHBOARDS) {
    await updateDashboardRelation(db, COA_DASHBOARD_CODE, SCHOOLS_DASHBOARD_CODE, code);
  }

  await removeDashboard(db, GIR_DASHBOARD_CODE);
  await removeDashboard(db, COA_DASHBOARD_CODE);

  return null;
};

exports._meta = {
  version: 1,
};
