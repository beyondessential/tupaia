'use strict';

var dbm;
var type;
var seed;

import { AGGREGATION_TYPES } from '@tupaia/aggregator/src/aggregationTypes';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    insert into "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    values (
      'COVID_Tests_Per_Capita',
      'percentagesByNominatedPairs',
      '{
        "pairs": {"dailysurvey006": "AU_POP002"},
        "aggregationTypes": {
          "numerator": "${AGGREGATION_TYPES.SUM}",
          "denominator": "${AGGREGATION_TYPES.FINAL_EACH_DAY_FILL_EMPTY_DAYS}"
        }
      }',
      '{
        "name":"COVID-19 Tests per capita",
        "type": "chart",
        "chartType": "line",
        "valueType": "percentage",
        "periodGranularity": "day"
      }'
    );

    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{COVID_Tests_Per_Capita}'
    where code = 'AU_Covid_Country';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    delete from "dashboardReport" where id = 'COVID_Tests_Per_Capita';

    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", '"COVID_Tests_Per_Capita"')
    where code = 'AU_Covid_Country';
  `);
};

exports._meta = {
  version: 1,
};
