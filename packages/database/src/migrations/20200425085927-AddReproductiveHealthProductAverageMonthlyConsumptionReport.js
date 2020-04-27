'use strict';

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

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO "dashboardReport" ("id", "dataBuilder", "dataBuilderConfig", "viewJson")
    VALUES (
      'UNFPA_Reproductive_Health_Product_AMC',
      'sumPerMonth',
      '{
        "dataClasses": {
          "Male condoms": {
            "codes": ["AMC_3b3444bf"]
          },
          "Male condoms, varied": {
            "codes": ["AMC_a162942e"]
          },
          "Female condoms": {
            "codes": ["AMC_bf4be518"]
          },
          "COCs": {
            "codes": ["AMC_402924bf"]
          },
          "POP": {
            "codes": ["AMC_47d584bf"]
          },
          "Implant Contraceptives": {
            "codes": ["AMC_3ff944bf"]
          },
          "Jadelle": {
            "codes": ["AMC_d2d28620"]
          },
          "EC (2 dose)": {
            "codes": ["AMC_47fb04bf"]
          },
          "EC (single dose)": {
            "codes": ["ACM_47fe44bf"]
          },
          "Depot": {
            "codes": ["AMC_53d014bf"]
          },
          "SAYANA Press": {
            "codes": ["AMC_4752843e"]
          },
          "Norethisterone": {
            "codes": ["AMC_542a34bf"]
          },
          "IUD": {
            "codes": ["AMC_4718f43e"]
          },
          "Copper IUD": {
            "codes": ["AMC_3b3994bf"]
          }
        }
      }',
      '{
        "name": "Reproductive Health Product Average Monthly Consumption (AMC)",
        "type": "chart",
        "chartType": "line",
        "valueType": "text",
        "chartConfig": {
          "Male condoms": {
            "label": "Male condoms",
            "legendOrder" : 0
          },
          "Male condoms, varied": {
            "label": "Male condoms, varied",
            "legendOrder" : 1
          },
          "Female condoms": {
            "label": "Female condoms",
            "legendOrder" : 2
          },
          "COCs": {
            "label": "COCs",
            "legendOrder" : 3
          },
          "POP": {
            "label": "POP",
            "legendOrder" : 4
          },
          "Implant Contraceptives": {
            "label": "Implant Contraceptives",
            "legendOrder" : 5
          },
          "Jadelle": {
            "label": "Jadelle",
            "legendOrder" : 6
          },
          "EC (2 dose)": {
            "label": "EC (2 dose)",
            "legendOrder" : 7
          },
          "EC (single dose)": {
            "label": "EC (single dose)",
            "legendOrder" : 8
          },
          "Depot": {
            "label": "Depot",
            "legendOrder" : 9
          },
          "SAYANA Press": {
            "label": "SAYANA Press",
            "legendOrder" : 10
          },
          "Norethisterone": {
            "label": "Norethisterone",
            "legendOrder" : 11
          },
          "IUD": {
            "label": "IUD",
            "legendOrder" : 11
          },
          "Copper IUD": {
            "label": "Copper IUD",
            "legendOrder" : 12
          }
        },
        "periodGranularity": "month"
      }'
    );

  UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{UNFPA_Reproductive_Health_Product_AMC}'
    WHERE code = 'DL_Unfpa_Country';

  UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '{
      "dataClasses": {
          "value": {
            "codes": [
              "dailysurvey003"
            ]
          }
      }
    }'
    WHERE id = 'COVID_New_Cases_By_Day';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = 'UNFPA_Reproductive_Health_Product_AMC';

    UPDATE "dashboardGroup"
    SET "dashboardReports" = array_remove("dashboardReports", '"UNFPA_Reproductive_Health_Product_AMC"')
    WHERE code = 'DL_Unfpa_Country';

    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = '{
      "dataSource": {
          "codes": [
              "dailysurvey003"
          ]
      }
    }'
    WHERE id = 'COVID_New_Cases_By_Day';
  `);
};

exports._meta = {
  "version": 1
};
