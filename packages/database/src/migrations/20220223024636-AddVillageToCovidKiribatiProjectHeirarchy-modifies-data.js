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

const NEW_VALUE = 'village';
const REMOVE_VALUE = 'facility';
const PROJECT_NAME = 'covid_kiribati';

exports.up = async function (db) {
  await removeArrayValue(
    db,
    'entity_hierarchy',
    'canonical_types',
    REMOVE_VALUE,
    `"name" = '${PROJECT_NAME}'`,
  );
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
  await addArrayValue(
    db,
    'entity_hierarchy',
    'canonical_types',
    REMOVE_VALUE,
    `"name" = '${PROJECT_NAME}'`,
  );
};

exports._meta = {
  version: 1,
};
