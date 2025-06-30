'use strict';

import { codeToId, insertObject, generateId, nameToId } from '../utilities';

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

const facilities = [
  { code: 'MH_037', parent: 'MH_Wotje' },
  { code: 'MH_038', parent: 'MH_Wotje' },
];
const hierarchyCode = 'unfpa';

exports.up = async function (db) {
  const hierarchyId = await nameToId(db, 'entity_hierarchy', hierarchyCode);

  await Promise.all(
    facilities.map(async facility =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: await codeToId(db, 'entity', facility.parent),
        child_id: await codeToId(db, 'entity', facility.code),
        entity_hierarchy_id: hierarchyId,
      }),
    ),
  );
};

exports.down = async function (db) {
  const hierarchyId = await nameToId(db, 'entity_hierarchy', hierarchyCode);

  await Promise.all(
    facilities.map(async facility => {
      const entityId = await codeToId(db, 'entity', facility.code);
      return db.runSql(`
        delete from entity_relation
        where child_id = '${entityId}' 
        and entity_hierarchy_id = '${hierarchyId}';
      `);
    }),
  );
};

exports._meta = {
  version: 1,
};
