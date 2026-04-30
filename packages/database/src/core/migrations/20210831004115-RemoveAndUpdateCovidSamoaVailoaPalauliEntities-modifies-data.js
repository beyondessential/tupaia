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

const deleteEntityCode = 'WS_012_Vailoa_Palauli';
const updateEntityCode = 'WS_012_Vailoa_Satupaitea';
const newEntityName = 'Vailoa Palauli';
exports.up = async function (db) {
  const deleteEntityId = await codeToId(db, 'entity', deleteEntityCode);
  await db.runSql(`
    DELETE FROM entity_relation
    WHERE child_id = '${deleteEntityId}' or parent_id = '${deleteEntityId}';

    DELETE FROM survey_response
    WHERE entity_id = '${deleteEntityId}';

    DELETE FROM entity
    WHERE code = '${deleteEntityCode}';

    UPDATE entity
    SET name = '${newEntityName}'
    WHERE code = '${updateEntityCode}';
  `);
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
