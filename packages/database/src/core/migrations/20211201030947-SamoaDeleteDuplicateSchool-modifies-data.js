'use strict';

import { codeToId } from '../utilities';

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

const SCHOOL_CODE = 'WS_sch143';

exports.up = async function (db) {
  const schoolId = await codeToId(db, 'entity', SCHOOL_CODE);
  await db.runSql(`
  DELETE FROM "survey_response" WHERE "entity_id" = '${schoolId}';
  `);
  return db.runSql(`
  DELETE FROM "entity" WHERE "id" = '${schoolId}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
