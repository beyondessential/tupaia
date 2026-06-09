'use strict';

import { generateId, insertObject, deleteObject, updateValues } from '../utilities';

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

const COMBINED_DASHBOARD_ORDER = [
  'Students',
  'Teachers',
  'Teaching-Learning Materials',

  'Schools',
  'Staff',
  'Student Enrolment',
  'Student Outcomes',
  'Textbooks & Teacher Guides',

  'WASH',
  'ICT Facilities',
  'Emergency/Disaster Affected', // Doesn't currently exist
  'FQS',
  'School Development and Finance',
  'Development Priorities & Finance', // Currently named 'Development Partners and Finance'
];

exports.up = async function (db) {
  await updateValues(
    db,
    'dashboard',
    { name: 'Development Priorities & Finance' }, // new value
    { name: 'Development Partners and Finance' }, // old value
  );
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: 'LA_Emergency_Disaster_Affected',
    name: 'Emergency/Disaster Affected',
    root_entity_code: 'LA',
  });
  for (const [index, value] of COMBINED_DASHBOARD_ORDER.entries()) {
    await updateValues(db, 'dashboard', { sort_order: index }, { name: value });
  }
};

exports.down = async function (db) {
  for (const dashboard of COMBINED_DASHBOARD_ORDER) {
    await updateValues(db, 'dashboard', { sort_order: null }, { name: dashboard });
  }
  await updateValues(
    db,
    'dashboard',
    { name: 'Development Partners and Finance' }, // new value
    { name: 'Development Priorities & Finance' }, // old value
  );
  await deleteObject(db, 'dashboard', { name: 'Emergency/Disaster Affected' });
};

exports._meta = {
  version: 1,
};
