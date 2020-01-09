'use strict';

import { arrayToDbString } from '../migrationUtilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const OVERLAY_IDS = {
  count: [
    'CD_Measles_Age_Lt5_Cases',
    'CD_Measles_Age_Gte5_Cases',
    'CD_Measles_Female_Cases',
    'CD_Measles_Male_Cases',
    'CD_Measles_Total_Cases_radius',
    'CD_Measles_Total_Cases_spectrum',
  ],
  composedPercentages: [
    'CD_Measles_New_Cases_10kPax_Age_Gte_25',
    'CD_Measles_New_Cases_10kPax_Age_In_5_24',
    'CD_Measles_New_Cases_10kPax_Age_Lt_5',
  ],
};

const ENTITY_TYPE_FIELD = `'{"dataSourceEntityType": "village"}'`;

exports.up = async function(db) {
  return db.runSql(`
    UPDATE
      "mapOverlay"
    SET
    "measureBuilderConfig" = "measureBuilderConfig" || ${ENTITY_TYPE_FIELD}
    WHERE
      id IN (${arrayToDbString(OVERLAY_IDS.count)});

    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = jsonb_set(
        "measureBuilderConfig",
        '{measureBuilders, numerator, measureBuilderConfig}',
        "measureBuilderConfig"::jsonb#>'{measureBuilders, numerator, measureBuilderConfig}' || ${ENTITY_TYPE_FIELD}
      )
    WHERE
      id IN (${arrayToDbString(OVERLAY_IDS.composedPercentages)});
  `);
};

exports.down = async function(db) {
  return db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = "measureBuilderConfig" #- '{dataSourceEntityType}'
    WHERE
      id IN (${arrayToDbString(OVERLAY_IDS.count)});

    UPDATE
      "mapOverlay"
    SET
    "measureBuilderConfig" = "measureBuilderConfig" #-
      '{measureBuilders, numerator, measureBuilderConfig, dataSourceEntityType}'
    WHERE
      id IN (${arrayToDbString(OVERLAY_IDS.composedPercentages)});
  `);
};

exports._meta = {
  version: 1,
};
