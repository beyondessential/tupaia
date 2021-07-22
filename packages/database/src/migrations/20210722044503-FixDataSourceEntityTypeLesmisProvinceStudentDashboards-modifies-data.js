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

const dashboards = [
  'LESMIS_gross_intake_ratio_primary_province',
  'LESMIS_gross_intake_ratio_lower_secondary_province',
  'LESMIS_gross_intake_ratio_upper_secondary_province',
];

exports.up = function (db) {
  return db.runSql(`
    UPDATE report
    SET config = jsonb_set(config, '{fetch,aggregations,0,config,dataSourceEntityType}','"district"', false)
    WHERE code IN (${arrayToDbString(dashboards)})
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE report
    SET config = jsonb_set(config, '{fetch,aggregations,0,config,dataSourceEntityType}','"sub_district"', false)
    WHERE code IN (${arrayToDbString(dashboards)})
  `);
};

exports._meta = {
  version: 1,
};
