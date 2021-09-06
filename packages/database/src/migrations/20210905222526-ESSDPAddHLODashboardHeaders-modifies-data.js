'use strict';

import {
  insertObject,
  generateId,
  deleteObject,
  updateValues,
  findSingleRecord,
} from '../utilities';

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

const SUBSECTORS = [
  'EarlyChildhoodSubSector',
  'PrimarySubSector',
  'LowerSecondarySubSector',
  'UpperSecondarySubSector',
];

const NEW_DASHBOARDS = [
  ...SUBSECTORS.map(sector => ({
    code: `LESMIS_ESSDP_${sector}_HLO1`,
    name: 'HLO 1: Graduates',
  })),
  ...SUBSECTORS.map(sector => ({
    code: `LESMIS_ESSDP_${sector}_HLO2`,
    name: 'HLO 2: Competent Teachers',
  })),
  ...SUBSECTORS.map(sector => ({
    code: `LESMIS_ESSDP_${sector}_HLO3`,
    name: 'HLO 3: Resources',
  })),
  // From the docs only USE has HLO5
  {
    code: 'LESMIS_ESSDP_UpperSecondarySubSector_HLO5',
    name: 'HLO 5: School Leavers',
  },
];

const DASHBOARD_ITEMS = [
  'LESMIS_enrolment_ece_5_target',
  'LESMIS_enrolment_ece_3_4_target',
  'LESMIS_enrolment_ece_0_2_target',
  'LESMIS_ESSDP_ECE_HLO1', // We'll be moving it after it's renamed
];

const moveItemToNewDashboard = async (db, itemCode, oldDashboardCode, newDashboardCode) => {
  const itemId = (await findSingleRecord(db, 'dashboard_item', { code: itemCode })).id;
  const oldDashboardId = (await findSingleRecord(db, 'dashboard', { code: oldDashboardCode })).id;
  const newDashboardId = (await findSingleRecord(db, 'dashboard', { code: newDashboardCode })).id;

  await updateValues(
    db,
    'dashboard_relation',
    { dashboard_id: newDashboardId }, // new values
    { dashboard_id: oldDashboardId, child_id: itemId }, // old values
  );
};

exports.up = async function (db) {
  // Add new dashboards
  for (const { code, name } of NEW_DASHBOARDS) {
    await insertObject(db, 'dashboard', {
      id: generateId(),
      code,
      name,
      root_entity_code: 'LA',
    });
  }
  // Rename list to be more accurate
  await updateValues(
    db,
    'report',
    { code: 'LESMIS_ESSDP_ECE_HLO1' }, // new value
    { code: 'LESMIS_ESSDP_ECE_SubSector_List' }, // old value
  );
  await updateValues(
    db,
    'dashboard_item',
    { code: 'LESMIS_ESSDP_ECE_HLO1', report_code: 'LESMIS_ESSDP_ECE_HLO1' }, // new values
    { code: 'LESMIS_ESSDP_ECE_SubSector_List' }, // old value
  );
  // Move list and drilldowns to new dashboard
  for (const code of DASHBOARD_ITEMS) {
    await moveItemToNewDashboard(
      db,
      code,
      'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
      'LESMIS_ESSDP_EarlyChildhoodSubSector_HLO1',
    );
  }
};

exports.down = async function (db) {
  // Move list and drilldowns back to old dashboard
  for (const code of DASHBOARD_ITEMS) {
    await moveItemToNewDashboard(
      db,
      code,
      'LESMIS_ESSDP_EarlyChildhoodSubSector_HLO1',
      'LESMIS_ESSDP_EarlyChildhoodSubSector_Schools',
    );
  }
  // Rename list
  await updateValues(
    db,
    'report',
    { code: 'LESMIS_ESSDP_ECE_SubSector_List' }, // new value
    { code: 'LESMIS_ESSDP_ECE_HLO1' }, // old value
  );
  await updateValues(
    db,
    'dashboard_item',
    { code: 'LESMIS_ESSDP_ECE_SubSector_List', report_code: 'LESMIS_ESSDP_ECE_SubSector_List' }, // new value
    { code: 'LESMIS_ESSDP_ECE_HLO1' }, // old values
  );
  // Remove new dashboards
  for (const { code } of NEW_DASHBOARDS) {
    await deleteObject(db, 'dashboard', { code });
  }
};

exports._meta = {
  version: 1,
};
