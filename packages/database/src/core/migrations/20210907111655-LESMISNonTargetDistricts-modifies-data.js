'use strict';

import { TARGET_DISTRICTS } from './migrationData/20210811234228-AddLESMISTargetDistricts';
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

exports.up = function (db) {
  return db.runSql(`
    UPDATE entity
    SET attributes = jsonb_insert(attributes, '{type}', '"LESMIS_Non_Target_District"')
    WHERE country_code = 'LA' AND type = 'sub_district'
    AND code NOT IN (${arrayToDbString(TARGET_DISTRICTS)})
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE entity
    SET attributes = attributes - 'type'
    WHERE country_code = 'LA' AND type = 'sub_district'
    AND code NOT IN (${arrayToDbString(TARGET_DISTRICTS)})
  `);
};

exports._meta = {
  version: 1,
};
