'use strict';

var dbm;
var type;
var seed;

import { buildSingleColumnTableCells } from '../migrationUtilities';

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
    DELETE FROM "dashboardReport" WHERE id = 'TO_CH_Validation_CH_4' AND "drillDownLevel" = 1;

    UPDATE
      "dashboardReport"
    SET
      "dataBuilder" = 'tableOfDataValues',
      "dataBuilderConfig" = '${JSON.stringify({
        rows: [
          {
            category: '$orgUnit',
            rows: [
              'Risk Factor - Smokers',
              'Risk Factor - Alcohol Drinkers',
              'Risk Factor - Overweight (BMI 25 to 29.9)',
              'Risk Factor - Class 1 Obesity (BMI 30.0 to 34.9)',
              'Risk Factor - Class 2 Obesity (BMI 35.0 to 39.9)',
              'Risk Factor - Class 3 Obesity (BMI ≥ 40)',
              'CVD Risk - Green <10%',
              'CVD Risk - Yellow 10% to <20%',
              'CVD Risk - Orange 20% to <30%',
              'CVD Risk - Red 30% to <40%',
              'CVD Risk - Deep Red >40%',
            ],
          },
        ],
        columns: ['Number'],
        cells: buildSingleColumnTableCells('CH', 287, 297),
      })}'
    WHERE
      id = 'TO_CH_Validation_CH_4';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
