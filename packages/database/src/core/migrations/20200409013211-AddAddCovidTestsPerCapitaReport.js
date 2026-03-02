('use strict');

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
    insert into "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    values (
      'COVID_Tests_Per_Capita',
      'sumPreviousValuesPer100kPerDayByOrgUnit',
      '{"divisor": "AU_POP002", "dataElementCodes": ["dailysurvey006"]}',
      '{
        "periodGranularity" : "day",
        "chartConfig" : {
          "AU_Australian Capital Territory" : {
            "label" : "ACT",
            "legendOrder" : 0
          },
          "AU_New South Wales" : {
            "label" : "NSW",
            "legendOrder" : 1
          },
          "AU_Northern Territory" : {
            "label" : "NT",
            "legendOrder" : 2
          },
          "AU_Queensland" : {
            "label" : "QLD",
            "legendOrder" : 3
          },
          "AU_South Australia" : {
            "label" : "SA",
            "legendOrder" : 4
          },
          "AU_Tasmania" : {
            "label" : "TAS",
            "legendOrder" : 5
          },
          "AU_Victoria" : {
            "label" : "VIC",
            "legendOrder" : 6
          },
          "AU_Western Australia" : {
            "label" : "WA",
            "legendOrder" : 7
          }
        },
        "chartType" : "line",
        "name" : "COVID-19 Total tests per capita",
        "type" : "chart",
        "description" : "Total tests per 100k"
      }'
    );

    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{COVID_Tests_Per_Capita}'
    where code = 'AU_Covid_Country';
  `);
};

exports.down = function (db) {
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
