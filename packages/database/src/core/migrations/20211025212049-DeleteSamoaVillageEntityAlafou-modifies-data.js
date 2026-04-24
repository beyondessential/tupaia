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

const ALAFOU_ENTITY_CODE = 'WS_003_Alafou';

exports.up = async function (db) {
  const alafouEntityId = await codeToId(db, 'entity', ALAFOU_ENTITY_CODE);

  // Delete Alafou village
  await db.runSql(`
    DELETE FROM answer
    WHERE survey_response_id IN (
      SELECT survey_response.id 
      FROM survey_response
      WHERE survey_response.entity_id = '${alafouEntityId}'
    );

    DELETE FROM survey_response
    WHERE entity_id = '${alafouEntityId}';
  
    DELETE FROM entity_relation
    WHERE child_id = '${alafouEntityId}';
  
    DELETE FROM entity
    WHERE id = '${alafouEntityId}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
