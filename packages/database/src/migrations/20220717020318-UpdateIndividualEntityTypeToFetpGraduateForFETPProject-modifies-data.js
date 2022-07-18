'use strict';

import ENTITIES from './migrationData/20220717020318-UpdateIndividualEntityTypeToFetpGraduateForFETPProject.json';
import { updateValues, codeToId } from '../utilities';

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

exports.up = async function (db) {
  for (const entity of ENTITIES) {
    const parentId = await codeToId(db, 'entity', entity.parent_code);
    await updateValues(
      db,
      'entity',
      { type: 'fetp_graduate' },
      {
        code: entity.code,
        parent_id: parentId,
        country_code: 'PG',
      },
    );
  }
};

exports.down = async function (db) {
  for (const entity of ENTITIES) {
    const parentId = await codeToId(db, 'entity', entity.parent_code);
    await updateValues(
      db,
      'entity',
      { type: 'individual' },
      {
        code: entity.code,
        parent_id: parentId,
        country_code: 'PG',
      },
    );
  }
};

exports._meta = {
  version: 1,
};
