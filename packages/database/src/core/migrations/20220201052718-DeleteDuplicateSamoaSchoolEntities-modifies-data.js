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

const SCHOOL_CODES = ['WS_sch143', 'WS_sch160'];

exports.up = async function (db) {
  for (const code of SCHOOL_CODES) {
    const schoolId = await codeToId(db, 'entity', code);
    await deleteObject(db, 'entity_relation', { child_id: schoolId });
    await deleteObject(db, 'survey_response', { entity_id: schoolId });
    await deleteObject(db, 'entity', { id: schoolId });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
