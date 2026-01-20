'use strict';

import { codeToId, deleteObject } from '../utilities';

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

const ENTITY_CODES = ['DEHHM-EX6DR', 'DEHHM-5DQLR', 'DEHHM-5XYC1', 'DEHHM-56TRN', 'HID-FXU-AE5J'];

exports.up = async function (db) {
  for (const code of ENTITY_CODES) {
    const entityId = await codeToId(db, 'entity', code);
    await deleteObject(db, 'survey_response', { entity_id: entityId });
    await deleteObject(db, 'entity_relation', { child_id: entityId });
    await deleteObject(db, 'entity', { id: entityId });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
