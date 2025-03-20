'use strict';

import { arrayToDbString } from '../utilities';

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

const newConfig = {
  frontendExcludedTypes: ['postcode'],
};
const projectCodes = ['explore'];

exports.up = function (db) {
  return db.runSql(`
    update "project" 
    set "config" = "config"::jsonb || '${JSON.stringify(newConfig)}'::jsonb
    where "code" in (${arrayToDbString(projectCodes)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "project" 
    set "config" = "config"::jsonb #- '{frontend_excluded_types}'
    where "code" in (${arrayToDbString(projectCodes)});
  `);
};

exports._meta = {
  version: 1,
};
