'use strict';

import { deleteObject, findSingleRecord } from '../utilities';

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

const HOUSEHOLD_CODE = 'HID-8L3-R0U7';

exports.up = async function (db) {
  const { rows: results } = await db.runSql(`
    SELECT FROM entity 
    WHERE code = '${HOUSEHOLD_CODE}'
  `);
  const [householdRecord] = results;
  if (!householdRecord) {
    return;
  }

  // make sure entity is not referenced in downstream tables
  await deleteObject(db, 'survey_response', { entity_id: householdRecord.id });
  await deleteObject(db, 'access_request', { entity_id: householdRecord.id });
  await deleteObject(db, 'user_entity_permission', { entity_id: householdRecord.id });
  await deleteObject(db, 'entity_relation', { child_id: householdRecord.id });

  // finally, delete the entity record
  await deleteObject(db, 'entity', { id: householdRecord.id });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
