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

const PROVINCE_REPORTS = [
  'LESMIS_gross_intake_ratio_primary_province',
  'LESMIS_gross_intake_ratio_lower_secondary_province',
  'LESMIS_gross_intake_ratio_upper_secondary_province',
];

const COUNTRY_REPORTS = [
  'LESMIS_gross_intake_ratio_primary_country',
  'LESMIS_gross_intake_ratio_lower_secondary_country',
  'LESMIS_gross_intake_ratio_upper_secondary_country',
];

exports.up = async function (db) {
  await db.runSql(`
    UPDATE report
    SET config = jsonb_set(config, '{fetch,aggregations,0,config,dataSourceEntityType}','"district"', false)
    WHERE code IN (${arrayToDbString(PROVINCE_REPORTS)});
  `);
  await db.runSql(`
    UPDATE report
    SET config = jsonb_set(config, '{fetch,aggregations,0,config,dataSourceEntityType}','"country"', false)
    WHERE code IN (${arrayToDbString(COUNTRY_REPORTS)});
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE report
    SET config = jsonb_set(config, '{fetch,aggregations,0,config,dataSourceEntityType}','"sub_district"', false)
    WHERE code IN (${arrayToDbString(PROVINCE_REPORTS)});
  `);
  await db.runSql(`
    UPDATE report
    SET config = jsonb_set(config, '{fetch,aggregations,0,config,dataSourceEntityType}','"sub_district"', false)
    WHERE code IN (${arrayToDbString(COUNTRY_REPORTS)});
  `);
};

exports._meta = {
  version: 1,
};
