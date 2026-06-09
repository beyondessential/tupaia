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

/*
  Update PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations: 
  consultationCount codes from SSWT1001 (consultations) to SSWT1072 (RDT tests done) 
*/
const REPORT_ID = 'PG_Strive_PNG_Weekly_Percentage_of_Positive_Malaria_Against_Consultations';
const OLD_VALUE = '["SSWT1001"]';
const NEW_VALUE = '["SSWT1072"]';
const JSONPATH =
  '{dataBuilders,positive,dataBuilderConfig,dataBuilders,consultationCount,dataBuilderConfig,dataSource,codes}';

exports.up = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${JSONPATH}', '${NEW_VALUE}'::jsonb)
  where "id" = '${REPORT_ID}';
`);
};

exports.down = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${JSONPATH}', '${OLD_VALUE}'::jsonb)
  where "id" = '${REPORT_ID}';
`);
};

exports._meta = {
  version: 1,
};

/* Existing config:
{
  "dataBuilders": {
    "positive": {
      "dataBuilder": "composePercentagesPerPeriod",
      "dataBuilderConfig": {
        "percentages": {
          "value": {
            "numerator": "positiveCount",
            "denominator": "consultationCount"
          }
        },
        "dataBuilders": {
          "positiveCount": {
            "dataBuilder": "sumPerWeek",
            "dataBuilderConfig": {
              "dataSource": {
                "type": "single",
                "codes": [
                  "SSWT1021",
                  "SSWT1022",
                  "SSWT1023"
                ]
              }
            }
          },
          "consultationCount": {
            "dataBuilder": "sumPerWeek",
            "dataBuilderConfig": {
              "dataSource": {
                "type": "single",
                "codes": [
                  "SSWT1001"
                ]
              }
            }
          }
        }
      }
    },
    "consultations": {
      "dataBuilder": "sumPerWeek",
      "dataBuilderConfig": {
        "dataSource": {
          "type": "single",
          "codes": [
            "SSWT1001"
          ]
        }
      }
    }
  }
}

*/
