'use strict';

var dbm;
var type;
var seed;

const ROWS = [
  {
    category: '$orgUnit',
    rows: [
      'Number Screened',
      'CVD Risk - Green <10%',
      'CVD Risk - Yellow 10% to <20%',
      'CVD Risk - Orange 20% to <30%',
      'CVD Risk - Red 30% to <40%',
      'CVD Risk - Deep Red >40%',
      'Overweight',
      'Class 1 Obesity',
      'Class 2 Obesity',
      'Class 3 Obesity',
      'Borderline Fasting Blood Sugar',
      'High Fasting Blood Sugar',
      'Moderate High Blood Pressure',
      'Very High Blood Pressure',
      'Smokers',
      'Alcohol Drinkers',
      'Referrals',
      'Family History of NCD - Yes',
      'Family History of NCD - No',
    ],
  },
];

const COLUMNS = [
  '10-19 Male',
  '10-19 Female',
  '20-29 Male',
  '20-29 Female',
  '30-59 Male',
  '30-59 Female',
  '60+ Male',
  '60+ Female',
  'Totals',
];

const START_CELL = 452;

const buildCells = () => {
  const cells = [];

  let i = START_CELL;
  for (let row = 0; row < ROWS[0].rows.length; row++) {
    const cellRow = [];
    for (let column = 0; column < COLUMNS.length - 1; column++) {
      cellRow.push(`CH${i}`);
      i++;
      if (i === 544) {
        // Data element `CH544` does not exist
        i++;
      }
    }
    cellRow.push('$rowTotal');

    cells.push(cellRow);
  }

  return cells;
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = 'TO_CH_Validation_CH_11' AND "drillDownLevel" = 1;

    UPDATE
      "dashboardReport"
    SET
      "dataBuilder" = 'tableOfDataValues',
      "dataBuilderConfig" = '${JSON.stringify({
        rows: ROWS,
        columns: COLUMNS,
        cells: buildCells(),
      })}'
    WHERE
      id = 'TO_CH_Validation_CH_11';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
