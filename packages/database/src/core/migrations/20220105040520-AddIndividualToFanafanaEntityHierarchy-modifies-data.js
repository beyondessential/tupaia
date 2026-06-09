'use strict';

import { addArrayValue, removeArrayValue } from '../utilities';

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

const NEW_VALUE = 'individual';
const PROJECT_NAME = 'fanafana';

exports.up = async function (db) {
  await addArrayValue(
    db,
    'entity_hierarchy',
    'canonical_types',
    NEW_VALUE,
    `"name" = '${PROJECT_NAME}'`,
  );
};

exports.down = async function (db) {
  await removeArrayValue(
    db,
    'entity_hierarchy',
    'canonical_types',
    NEW_VALUE,
    `"name" = '${PROJECT_NAME}'`,
  );
};

exports._meta = {
  version: 1,
};
