'use strict';

import ENTITIES from './migrationData/20220905020318-UpdateIndividualEntityTypeToFetpGraduateForFETPProject.json';
import { updateValues, codeToId, nameToId, findSingleRecord } from '../utilities';

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

const PROJECT_CODE = 'fetp';

exports.up = async function (db) {
  for (const entity of ENTITIES) {
    const parentId = await codeToId(db, 'entity', entity.parent_code);
    const { id } = await findSingleRecord(db, 'entity', { code: entity.code, parent_id: parentId });
    await updateValues(
      db,
      'entity',
      { type: 'fetp_graduate' },
      {
        id,
      },
    );
  }
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  await db.runSql(`
    UPDATE "entity_hierarchy"
    SET "canonical_types" = '{country,district,sub_district,fetp_graduate}'
    WHERE "id" = '${hierarchyId}';
  `);
};

exports.down = async function (db) {
  for (const entity of ENTITIES) {
    const parentId = await codeToId(db, 'entity', entity.parent_code);
    const { id } = await findSingleRecord(db, 'entity', { code: entity.code, parent_id: parentId });
    await updateValues(
      db,
      'entity',
      { type: 'individual' },
      {
        id,
      },
    );
  }
  const hierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  await db.runSql(`
    UPDATE "entity_hierarchy"
    SET "canonical_types" = '{country,district,sub_district,individual}'
    WHERE "id" = '${hierarchyId}';
  `);
};

exports._meta = {
  version: 1,
};
