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

const existingDashboardCode = 'LESMIS_International_SDGs_students';
const GIRDashboardCode = 'LESMIS_International_SDGs_GIR';
const PCOADashboardCode = 'LESMIS_International_SDGs_PCOA';

const updateDashboardRelation = async (db, parentCode, childCode) => {
  const parentId = await codeToId(db, 'dashboard', parentCode);
  const childId = await codeToId(db, 'dashboard', childCode);
  console.log('parentId', parentId);
  console.log('childId', childId);

  return insertObject(db, 'dashboard_relation', {
    id: generateId(),
    child_id: childId,
    parent_id: parentId,
    project_codes: 'laos_schools',
    permission_groups: 'LESMIS Public',
  });
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
  // create new dashboards "LESMIS_International_SDGs_GIR" & "LESMIS_International_SDGs_PCOA"
  await addDashboard(db, '4.1.3 Gross Intake Ratio', GIRDashboardCode);
  await addDashboard(db, '4.1.6 Percentage of Children Over-Age', PCOADashboardCode);

  // update dashboard relations

  // delete "LESMIS_International_SDGs_students" dashboard
  // await db.runSql(`
  //     delete from dashboard
  //     where code = '${existingDashboardCode}';
  // `);

  return null;
};

exports.down = async function (db) {
  await removeDashboard(db, GIRDashboardCode);
  await removeDashboard(db, PCOADashboardCode);
  // await addDashboard(db, 'Students', existingDashboardCode);
  return null;
};

exports._meta = {
  version: 1,
};
