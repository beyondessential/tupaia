import { codeToId, updateValues } from '../utilities';

('use strict');

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

const PROJECT_CODE = 'covid_samoa';

const NEW_PROJECT_ENTITY_NAME = 'Samoa Health';

exports.up = async function (db) {
  const projectEntityId = await codeToId(db, 'entity', PROJECT_CODE);
  return updateValues(db, 'entity', { name: NEW_PROJECT_ENTITY_NAME }, { id: projectEntityId });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
