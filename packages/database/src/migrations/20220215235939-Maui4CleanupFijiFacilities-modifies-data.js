'use strict';

import { codeToId, generateId } from '../utilities';
import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

const facilitiesToDelete = ['FJ_059', 'FJ_045', 'FJ_157', 'FJ-14_HC_Sawakasa', 'FJ_244'];

const facilitiesToAddToEntityRelation = [
  { code: 'FJ_243', parent_code: 'FJ_Western' },
  { code: 'FJ_223', parent_code: 'FJ_Central' },
  { code: 'FJ_230', parent_code: 'FJ_Eastern' },
];
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

  facilitiesToAddToEntityRelation.forEach(async facility => {
    const entityId = await codeToId(db, 'entity', facility.code);
    const parentId = await codeToId(db, 'entity', facility.parent_code);
    const newEntityRelation = {
      id: generateId(),
      parent_id: parentId,
      child_id: entityId,
      entity_hierarchy_id: '606517f361f76a144800000a',
    };
    await insertObject(db, 'entity_relation', newEntityRelation);
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
