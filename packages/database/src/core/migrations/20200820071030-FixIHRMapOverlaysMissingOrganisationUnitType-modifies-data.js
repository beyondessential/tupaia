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

const IHR_REPORT_IDS = [
  '186',
  '185',
  '174',
  '175',
  '176',
  '177',
  '178',
  '179',
  '180',
  '181',
  '182',
  '187',
  '183',
  '184',
];

exports.up = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = "measureBuilderConfig" || '{ "entityAggregation": { "aggregationType": "REPLACE_ORG_UNIT_WITH_ORG_GROUP", "dataSourceEntityType": "facility", "aggregationEntityType": "district", "aggregationOrder": "BEFORE" }, "aggregationType": "MOST_RECENT_PER_ORG_GROUP" }'
    WHERE "measureBuilder" = 'mostRecentValueFromChildren';

    UPDATE "mapOverlay"
    SET "measureBuilder" = 'valueForOrgGroup'
    WHERE "measureBuilder" = 'mostRecentValueFromChildren' AND id IN (${arrayToDbString(
      IHR_REPORT_IDS,
    )});
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
