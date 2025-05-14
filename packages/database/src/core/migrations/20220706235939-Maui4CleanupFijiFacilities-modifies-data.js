'use strict';

import { codeToId } from '../utilities';

var dbm;
var type;
var seed;

const facilitiesToDelete = ['FJ_059', 'FJ_045', 'FJ_157', 'FJ-14_HC_Sawakasa', 'FJ_244'];

const entityRelationsToUpdate = [
  { oldEntityCode: 'FJ_059', newEntityCode: 'FJ_243' },
  { oldEntityCode: 'FJ_045', newEntityCode: 'FJ_223' },
  { oldEntityCode: 'FJ_157', newEntityCode: 'FJ_230' },
];

// The below clinic is a special case where in the clinic table the code has an extra space
const clinicWithWeirdCodeToDelete = 'FJ-14_HC_Sawakasa ';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  const selectSupplyChainFijiHierarchyId = await db.runSql(`
    SELECT id FROM entity_hierarchy WHERE name = 'supplychain_fiji';
  `);
  const [supplyChainFijiHierarchyResult] = selectSupplyChainFijiHierarchyId.rows;
  const supplyChainFijiHierarchyId = supplyChainFijiHierarchyResult.id;

  await Promise.all(
    entityRelationsToUpdate.map(async entity => {
      const oldEntityId = await codeToId(db, 'entity', entity.oldEntityCode);
      const newEntityId = await codeToId(db, 'entity', entity.newEntityCode);
      await db.runSql(`
        UPDATE entity_relation
        SET child_id = '${newEntityId}'
        WHERE child_id = '${oldEntityId}' AND entity_hierarchy_id = '${supplyChainFijiHierarchyId}';
      `);
    }),
  );

  await Promise.all(
    facilitiesToDelete.map(async facility => {
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
    }),
  );

  const weirdClinicId = await codeToId(db, 'clinic', clinicWithWeirdCodeToDelete);
  await db.runSql(`
    DELETE FROM clinic WHERE id = '${weirdClinicId}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
