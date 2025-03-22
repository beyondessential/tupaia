'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

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

const parentId = '5d51f501f013d6320f3cf633'; // Fiji
const hierarchyId = '5e9d06e261f76a30c4000015'; // WISH
const districts = [
  '5d5f79bcf013d60c0f186732', // FJ_Eastern
  '5d5f79bcf013d60c0f155cdc', // FJ_Central
  '5d5f79bcf013d60c0f16b406', // FJ_Northern
  '5df8072e61f76a485ce1f1ab', // FJ_Western
];

exports.up = async function (db) {
  districts.map(async district =>
    insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: parentId,
      child_id: district,
      entity_hierarchy_id: hierarchyId,
    }),
  );
};

exports.down = function (db) {
  return db.runSql(
    `DELETE FROM entity_relation 
    WHERE child_id IN (${arrayToDbString(districts)})
    AND entity_hierarchy_id = '${hierarchyId}';`,
  );
};

exports._meta = {
  version: 1,
};
