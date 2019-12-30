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

const BASE_REPORT_ID = 'TO_HPU_Validation_HP_01';

exports.up = function(db) {
  return db.runSql(`
    INSERT INTO
      "dashboardReport" ("id", "drillDownLevel", "dataBuilder", "dataBuilderConfig", "viewJson", "dataSources")
    VALUES
      (
        '${BASE_REPORT_ID}',
        1,
        'tableFromDataElementGroups',
        '{
          "programCode": "HP01",
          "stripFromRowNames": "HP01 Row - ",
          "stripFromColumnNames": "HP01 Column - ",
          "rowDataElementGroupSets": ["HP01_Rows"],
          "columnDataElementGroupSets": ["HP01_Columns"]
        }',
        '{
          "name": "Number of Sport Participants",
          "type": "chart",
          "chartType": "matrix",
          "placeholder": "/static/media/PEHSMatrixPlaceholder.png",
          "periodGranularity": "one_month_at_a_time"
        }',
        '[{ "isDataRegional": false }]'
      );

    UPDATE "dashboardReport"
      SET "viewJson" = "viewJson" || '{"drillDown": {"keyLink": "eventId", "parameterLink": "eventId"}}'
      WHERE id = '${BASE_REPORT_ID}'
        AND "drillDownLevel" IS NULL;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport"
      WHERE id = '${BASE_REPORT_ID}'
        AND "drillDownLevel" = 1;
    UPDATE "dashboardReport"
      SET "viewJson" = "viewJson" - 'drillDown'
      WHERE id = '${BASE_REPORT_ID}'
        AND "drillDownLevel" IS NULL;
  `);
};

exports._meta = {
  version: 1,
};
