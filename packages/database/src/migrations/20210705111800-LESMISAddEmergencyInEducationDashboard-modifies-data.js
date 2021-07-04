'use strict';

import { generateId, insertObject, deleteObject } from '../utilities';

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

const DASHBOARD_LIST = [
  {
    name: 'Basic Emergency/Disaster Information',
    code: 'LESMIS_EmergencyInEducation_Basic_Information',
    sort_order: 0,
  },
  {
    name: 'Loss Teaching & Learning Materials',
    code: 'LESMIS_EmergencyInEducation_Teaching_Learning_Materials',
    sort_order: 1,
  },
  {
    name: 'Teaching-Learning Continuity',
    code: 'LESMIS_EmergencyInEducation_Teaching_Learning_Continuity',
    sort_order: 2,
  },
  {
    name: 'WASH Affected',
    code: 'LESMIS_EmergencyInEducation_WASH_Affected',
    sort_order: 3,
  },
];

exports.up = async function (db) {
  for (const { name, code, sort_order } of DASHBOARD_LIST) {
    await insertObject(db, 'dashboard', {
      id: generateId(),
      code,
      name,
      root_entity_code: 'LA',
      sort_order,
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_LIST) {
    await deleteObject(db, 'dashboard', { code });
  }
};

exports._meta = {
  version: 1,
};
