'use strict';

import { arrayToDbString, generateId, insertObject, nameToId } from '../utilities';

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

const facilityCodes = [
  'MH_039',
  'MH_040',
  'MH_041',
  'MH_042',
  'MH_043',
  'MH_044',
  'MH_045',
  'MH_046',
  'MH_047',
  'MH_048',
  'MH_049',
  'MH_050',
  'MH_051',
  'MH_052',
  'MH_053',
  'MH_054',
  'MH_055',
  'MH_056',
  'MH_057',
  'MH_058',
  'MH_059',
  'MH_060',
];
const hierarchyCode = 'unfpa';

const updateEntityRelations = async (db, codes, hierarchyId) => {
  const { rows: entities } = await db.runSql(`
      select id, parent_id 
      from entity 
      where code in (${arrayToDbString(codes)})
      and id not in (select child_id from entity_relation where entity_hierarchy_id = '${hierarchyId}');
    `);
  await Promise.all(
    entities.map(entity =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: entity.parent_id,
        child_id: entity.id,
        entity_hierarchy_id: hierarchyId,
      }),
    ),
  );
};

exports.up = async function (db) {
  const hierarchyId = await nameToId(db, 'entity_hierarchy', hierarchyCode);
  const result = await updateEntityRelations(db, facilityCodes, hierarchyId);
  return result;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
