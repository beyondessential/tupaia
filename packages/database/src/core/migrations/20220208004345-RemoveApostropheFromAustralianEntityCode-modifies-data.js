'use strict';

import { updateValues } from '../utilities';

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

const ENTITY_CODE = "AU_Tasmania_Break O'Day";
const NEW_CODE = 'AU_Tasmania_BreakODay';

exports.up = async function (db) {
  await updateValues(db, 'entity', { code: NEW_CODE }, { code: ENTITY_CODE });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
