'use strict';

import { nameToId } from '../utilities';

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

const PROJECT_CODE = 'pacmossi';
const TRAP_TYPE = 'trap';

exports.up = async function (db) {
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  await db.runSql(`
    UPDATE "entity_hierarchy"
    SET "canonical_types" = '{country,district,field_station,larval_habitat,${TRAP_TYPE}}'
    WHERE "id" = '${hierarchyId}';
  `);
};

exports.down = async function (db) {
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  await db.runSql(`
    UPDATE "entity_hierarchy"
    SET "canonical_types" = '{country,district,field_station,larval_habitat}'
    WHERE "id" = '${hierarchyId}';
  `);
};

exports._meta = {
  version: 1,
};
