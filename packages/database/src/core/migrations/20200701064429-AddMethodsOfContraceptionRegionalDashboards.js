'use strict';

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

exports.up = async function (db) {
  await db.runSql(`
  INSERT INTO "public"."dashboardReport"("id","drillDownLevel","dataBuilder","dataBuilderConfig","viewJson","dataServices")
  VALUES
  (
    E'UNFPA_Monthly_3_Methods_of_Contraception_Regional',
    
    NULL,

    E'percentagesOfValueCountsPerPeriod',
    
    E'{
      "customFilter" : {
        "name" : "filterFacility",
        "comparator" : "<>"
      },
      "periodType" : "quarter",
      "dataClasses" : {
        "regional" : {
          "numerator" : {
            "dataValues" : [
              "RHS6UNFPA1354"
            ],
            "valueOfInterest" : 1
          },
          "denominator" : {
            "dataValues" : [
              "RHS6UNFPA1354"
            ],
            "valueOfInterest" : "*"
          }
        }
      },
      "isProjectReport" : true
    }',
    
    E'{
      "chartType" : "line",
      "labelType" : "fractionAndPercentage",
      "valueType" : "percentage",
      "chartConfig" : {
        "$all" : {}
      },
      "periodGranularity" : "quarter",
      "type" : "chart",
      "name" : "Primary Facilities Offering 3 Methods of Contraception (HFRSA)"
    }',
    
    E'[{"isDataRegional": true}]');
  `);

  await db.runSql(`
    INSERT INTO "public"."dashboardReport"("id","drillDownLevel","dataBuilder","dataBuilderConfig","viewJson","dataServices")
    VALUES
    (
      E'UNFPA_Monthly_5_Methods_of_Contraception_Regional',
      
      NULL,

      E'percentagesOfValueCountsPerPeriod',
      
      E'{
        "customFilter" : {
          "name" : "filterFacility",
          "comparator" : "="
        },
        "periodType" : "quarter",
        "dataClasses" : {
          "regional" : {
            "numerator" : {
              "dataValues" : [
                "RHS6UNFPA1355"
              ],
              "valueOfInterest" : 1
            },
            "denominator" : {
              "dataValues" : [
                "RHS6UNFPA1355"
              ],
              "valueOfInterest" : "*"
            }
          }
        },
        "isProjectReport" : true
      }',
      
      E'{
        "chartType" : "line",
        "labelType" : "fractionAndPercentage",
        "valueType" : "percentage",
        "chartConfig" : {
          "$all" : {}
        },
        "periodGranularity" : "quarter",
        "type" : "chart",
        "name" : "Secondary Health Care Facilities Offering at Least 5 Methods of Contraception (HRFSA)"
      }',
      
      E'[{"isDataRegional": true}]');
  `);

  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{UNFPA_Monthly_3_Methods_of_Contraception_Regional, UNFPA_Monthly_5_Methods_of_Contraception_Regional}'
    where "organisationUnitCode" = 'unfpa';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
