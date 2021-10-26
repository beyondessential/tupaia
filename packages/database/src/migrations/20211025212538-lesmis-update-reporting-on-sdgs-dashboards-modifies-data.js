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

const EXISTING_DASHBOARD_CODE = 'LESMIS_International_SDGs_students';

// Gross Intake Rate (GIR)
const GIR_DASHBOARD_CODE = 'LESMIS_International_SDGs_GIR';

// Percentage of Children Over Age (PCOA)
const PCOA_DASHBOARD_CODE = 'LESMIS_International_SDGs_PCOA';

const GIR_DASHBOARDS = [
  'LESMIS_gross_intake_ratio_primary_province',
  'LESMIS_gross_intake_ratio_lower_secondary_province',
  'LESMIS_gross_intake_ratio_upper_secondary_province',
  'LESMIS_gross_intake_ratio_primary_province_summary',
  'LESMIS_gross_intake_ratio_lower_secondary_province_summary',
  'LESMIS_gross_intake_ratio_upper_secondary_province_summary',
];

const PCOA_DASHBOARDS = [
  'LESMIS_province_pe_children_over_age',
  'LESMIS_province_lse_children_over_age',
];

const updateDashboardRelation = async (db, parentCode, childCode) => {
  const parentId = await codeToId(db, 'dashboard', parentCode);
  const childId = await codeToId(db, 'dashboard', childCode);

  console.log('parentId', parentId);
  console.log('childId', childId);

  return db.runSql(`
    UPDATE dashboard_relation SET dashboard_id = '${parentId}' 
    WHERE dashboard_id = '${EXISTING_DASHBOARD_CODE}' and child_id = '${childId}';
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
  await addDashboard(db, '4.1.6 Percentage of Children Over-Age', PCOA_DASHBOARD_CODE);

  // update GIR dashboard relations
  for (const code of GIR_DASHBOARDS) {
    await updateDashboardRelation(db, GIR_DASHBOARD_CODE, code);
  }

  // update PCOA dashboard relations
  for (const code of PCOA_DASHBOARDS) {
    await updateDashboardRelation(db, PCOA_DASHBOARD_CODE, code);
  }

  // delete old dashboard
  await db.runSql(`
      delete from dashboard
      where code = '${EXISTING_DASHBOARD_CODE}';
  `);

  return null;
};

exports.down = async function (db) {
  await removeDashboard(db, GIR_DASHBOARD_CODE);
  await removeDashboard(db, PCOA_DASHBOARD_CODE);
  // await addDashboard(db, 'Students', EXISTING_DASHBOARD_CODE);
  return null;
};

exports._meta = {
  version: 1,
};
