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
        'WHO_IHR_Reports',
        'matrixOfValuesForOrgUnits',
        '{
          "showCategoryValues": true,
          "columns" : [
            {
              "key" : "CK",
              "code" : "CK"
            },
            {
              "key" : "FJ",
              "code" : "FJ"
            },
            {
              "key" : "KI",
              "code" : "KI"
            },
            {
              "key" : "MH",
              "code" : "MH"
            },
            {
              "key" : "FM",
              "code" : "FM"
            },
            {
              "key" : "NR",
              "code" : "NR"
            },
            {
              "key" : "NU",
              "code" : "NU"
            },
            {
              "key" : "PW",
              "code" : "PW"
            },
            {
              "key" : "PG",
              "code" : "PG"
            },
            {
              "key" : "WS",
              "code" : "WS"
            },
            {
              "key" : "SB",
              "code" : "SB"
            },
            {
              "key" : "TO",
              "code" : "TO"
            },
            {
              "key" : "TV",
              "code" : "TV"
            },
            {
              "key" : "VU",
              "code" : "VU"
            }
          ],
          "rows" : [
            {
              "categoryId" : "C1",
              "dataElement" : "SPAR002"
            },
            {
              "categoryId" : "C1",
              "dataElement" : "SPAR003"
            },
            {
              "categoryId" : "C1",
              "dataElement" : "SPAR004"
            },
            {
              "categoryId" : "C2",
              "dataElement" : "SPAR005A"
            },
            {
              "categoryId" : "C2",
              "dataElement" : "SPAR006"
            },
            {
              "categoryId" : "C3",
              "dataElement" : "SPAR008"
            },
            {
              "categoryId" : "C4",
              "dataElement" : "SPAR010"
            },
            {
              "categoryId" : "C5",
              "dataElement" : "SPAR011A"
            },
            {
              "categoryId" : "C5",
              "dataElement" : "SPAR011B"
            },
            {
              "categoryId" : "C5",
              "dataElement" : "SPAR012"
            },
            {
              "categoryId" : "C6",
              "dataElement" : "SPAR013A"
            },
            {
              "categoryId" : "C6",
              "dataElement" : "SPAR014"
            },
            {
              "categoryId" : "C7",
              "dataElement" : "SPAR016"
            },
            {
              "categoryId" : "C8",
              "dataElement" : "SPAR017A"
            },
            {
              "categoryId" : "C8",
              "dataElement" : "SPAR017B"
            },
            {
              "categoryId" : "C8",
              "dataElement" : "SPAR018"
            },
            {
              "categoryId" : "C9",
              "dataElement" : "SPAR019A"
            },
            {
              "categoryId" : "C9",
              "dataElement" : "SPAR019B"
            },
            {
              "categoryId" : "C9",
              "dataElement" : "SPAR020"
            },
            {
              "categoryId" : "C10",
              "dataElement" : "SPAR022"
            },
            {
              "categoryId" : "C11",
              "dataElement" : "SPAR023A"
            },
            {
              "categoryId" : "C11",
              "dataElement" : "SPAR024"
            },
            {
              "categoryId" : "C12",
              "dataElement" : "SPAR026"
            },
            {
              "categoryId" : "C13",
              "dataElement" : "SPAR028"
            }
          ]
        }',
        '{
          "placeholder" : "/static/media/PEHSMatrixPlaceholder.png",
          "categories" : [
            {
              "key" : "C1",
              "title" : "Legislation and financing"
            },
            {
              "key" : "C2",
              "title" : "IHR Coordination"
            },
            {
              "key" : "C3",
              "title" : "Zoonotic events and the human-animal interface"
            },
            {
              "key" : "C4",
              "title" : "Food safety"
            },
            {
              "key" : "C5",
              "title" : "Laboratory"
            },
            {
              "key" : "C6",
              "title" : "Surveillance"
            },
            {
              "key" : "C7",
              "title" : "Human resources"
            },
            {
              "key" : "C8",
              "title" : "National health emergency framework"
            },
            {
              "key" : "C9",
              "title" : "Health service provision"
            },
            {
              "key" : "C10",
              "title" : "Risk communication"
            },
            {
              "key" : "C11",
              "title" : "Points of entry"
            },
            {
              "key" : "C12",
              "title" : "Chemical events"
            },
            {
              "key" : "C13",
              "title" : "Radiation emergencies"
            }
          ],
          "name" : "IHR Reports",
          "type" : "matrix"
        }'
      );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE "id" = 'WHO_IHR_Reports';
  `);
};

exports._meta = {
  version: 1,
};
