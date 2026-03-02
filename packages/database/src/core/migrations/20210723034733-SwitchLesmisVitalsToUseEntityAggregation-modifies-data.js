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

const VITALS_REPORTS = {
  LESMIS_school_vitals: 'school',
  LESMIS_sub_district_vitals: 'sub_district',
  LESMIS_village_vitals: 'village',
  LESMIS_multi_school_vitals: 'school',
};

exports.up = async function (db) {
  await Promise.all(
    Object.entries(VITALS_REPORTS).map(([reportCode, dataSourceEntityType]) => {
      return db.runSql(`
        UPDATE report
        SET config = jsonb_set(config, '{fetch,aggregations}','[{ "type": "MOST_RECENT", "config": { "dataSourceEntityType": "${dataSourceEntityType}" }}]', true)
        WHERE code = '${reportCode}';
      `);
    }),
  );

  await db.runSql(`
    UPDATE report
    SET config = jsonb_set(config, '{transform,1}','${JSON.stringify({
      transform: 'aggregate',
      organisationUnit: 'group',
      '...': 'last',
    })}', false)
    WHERE code IN (${arrayToDbString(Object.keys(VITALS_REPORTS))});
  `);
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
