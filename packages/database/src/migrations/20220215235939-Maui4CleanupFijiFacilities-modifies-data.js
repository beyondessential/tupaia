'use strict';

import { codeToId } from '../utilities';

var dbm;
var type;
var seed;

const facilitiesToDelete = ['FJ_059', 'FJ_223', 'FJ_230'];
/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  facilitiesToDelete.forEach(async facility => {
    const entityId = await codeToId(db, 'entity', facility);
    const clinicId = await codeToId(db, 'clinic', facility);
    await db.runSql(`
      DELETE FROM entity_relation WHERE child_id = '${entityId}';
    `);
    await db.runSql(`
      DELETE FROM entity WHERE id = '${entityId}';
    `);
    await db.runSql(`
      DELETE FROM clinic WHERE id = '${clinicId}';
    `);
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
