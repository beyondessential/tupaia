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

const newConfig = { sumTillLatestData: true };
const legacyReportCodes = [
  'COVID_AU_Total_Cases_Each_State_Per_Day',
  'COVID_Compose_Cumulative_Deaths_Vs_Cases',
  'COVID_Tests_Per_Capita',
];

exports.up = async function (db) {
  const regexReplaceValue = `"SUM_PREVIOUS_EACH_DAY","config":${JSON.stringify(newConfig)}`;
  await db.runSql(`
    update "legacy_report" dr
    set data_builder_config = regexp_replace(dr."data_builder_config"::text, '\\"SUM_PREVIOUS_EACH_DAY\\"','${regexReplaceValue}','g')::jsonb
    where code in (${arrayToDbString(legacyReportCodes)});
  `);
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
