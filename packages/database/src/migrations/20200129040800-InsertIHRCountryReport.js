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
          "columns" : [
            {
              "key" : "CK",
              "code" : "CK"
            },
            {
              "key" : "FJ",
              "code" : "FJ"
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
            }
          ]
        }',
        '{
          "placeholder" : "/static/media/PEHSMatrixPlaceholder.png",
          "categories" : [
            {
              "key" : "C1",
              "title" : "Legislation and financing"
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
