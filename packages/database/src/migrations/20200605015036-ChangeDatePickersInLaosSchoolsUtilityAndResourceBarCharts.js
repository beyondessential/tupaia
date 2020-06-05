'use strict';

var dbm;
var type;
var seed;

import { arrayToDbString } from '../utilities';

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const REPORT_IDS = [
  'LA_Laos_Schools_Service_Availability_Percentage_Preschool',
  'LA_Laos_Schools_Service_Availability_Percentage_Primary',
  'LA_Laos_Schools_Service_Availability_Percentage_Secondary',
  'LA_Laos_Schools_Resources_Percentage_Preschool',
  'LA_Laos_Schools_Resources_Percentage_Primary',
  'LA_Laos_Schools_Resources_Percentage_Secondary',
];

const NEW_PERIOD_GRANULARITY = 'one_month_at_a_time';
const OLD_PERIOD_GRANULARITY = 'month';

exports.up = async function(db) {
  await db.runSql(`
    UPDATE "dashboardReport" 
    SET "viewJson" = jsonb_set("viewJson", '{periodGranularity}', '"${NEW_PERIOD_GRANULARITY}"')
    WHERE id in (${arrayToDbString(REPORT_IDS)});
  `);
};

exports.down = async function(db) {
  await db.runSql(`
    UPDATE "dashboardReport" 
    SET "viewJson" = jsonb_set("viewJson", '{periodGranularity}', '"${OLD_PERIOD_GRANULARITY}"')
    WHERE id in (${arrayToDbString(REPORT_IDS)});
`);
};

exports._meta = {
  "version": 1
};
