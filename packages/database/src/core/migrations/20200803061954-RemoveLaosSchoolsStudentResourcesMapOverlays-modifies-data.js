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

const OVERLAY_IDS = [
  'Laos_Schools_Students_Have_Own_Textbooks',
  'Laos_Schools_Students_Have_Textbooks_Grade_1',
  'Laos_Schools_Students_Have_Textbooks_Grade_2',
  'Laos_Schools_Students_Have_Textbooks_Grade_3',
  'Laos_Schools_Students_Have_Textbooks_Grade_4',
  'Laos_Schools_Students_Have_Textbooks_Grade_5',
  'Laos_Schools_Students_Have_Textbooks_Grade_6',
  'Laos_Schools_Students_Have_Textbooks_Grade_7',
  'Laos_Schools_Students_Have_Textbooks_Grade_8',
  'Laos_Schools_Students_Have_Textbooks_Grade_9',
];

const selectStudentResourcesGroup = async db =>
  db.runSql(`SELECT * FROM map_overlay_group where code = 'Student_Resources'`);

exports.up = async function (db) {
  const group = (await selectStudentResourcesGroup(db)).rows[0];

  await db.runSql(`
    DELETE FROM map_overlay_group_relation WHERE map_overlay_group_id = '${group.id}';
  `);

  await db.runSql(`
    DELETE FROM "map_overlay_group" WHERE id = '${group.id}';
  `);

  await db.runSql(`
    DELETE FROM "mapOverlay" WHERE id IN (${arrayToDbString(OVERLAY_IDS)})
  `);
};

exports.down = function (db) {
  return null; // No down migrations
};

exports._meta = {
  version: 1,
};
