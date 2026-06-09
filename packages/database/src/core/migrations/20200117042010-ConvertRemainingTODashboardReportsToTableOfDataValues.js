/* eslint-disable camelcase */

import {
  buildSingleColumnTableCells,
  build2DTableCells,
  build2dTableStringFormatCells,
} from '../utilities/migration';

('use strict');

var dbm;
var type;
var seed;

const convertToTableOfDataValuesSql = table => {
  return `
  UPDATE
      "dashboardReport"
  SET
    "dataBuilder" = 'tableOfDataValues',
    "dataBuilderConfig" = '${JSON.stringify({
      rows: table.category ? { category: table.category, rows: table.rows } : table.rows,
      columns: table.columns,
      cells: table.cells,
    })}'
  WHERE
    id = '${
      table.id
    }' AND "dataBuilder" IN ('singleColumnTable', 'tableFromDataElementGroups', 'tableOfDataValues');
  `;
};

//------------------------------------------------------------------------------
// Single Column Table Migrations
//------------------------------------------------------------------------------

const tableHPU_Validation_HP_04_New_Calls = {
  rows: ['Number of New Calls'],
  columns: ['Number'],
  cells: buildSingleColumnTableCells({ prefix: 'HP', start: 216, end: 216 }),
  id: 'TO_HPU_Validation_HP_04_New_Calls',
};

//------------------------------------------------------------------------------

const tableHPU_Validation_HP_05 = {
  rows: [
    'Billboard',
    'Brochure',
    'Corflute',
    'Flag',
    'Poster',
    'Pull-Up Banner',
    'Sticker',
    'T-Shirt',
    'Vinyl Banner',
    'Other',
    'If Other, specify',
  ],
  columns: ['Answer'],
  cells: [
    ['HP245a1'],
    ['HP245a'],
    ['HP245b'],
    ['HP245c'],
    ['HP245d'],
    ['HP245e'],
    ['HP245f'],
    ['HP245g'],
    ['HP245h'],
    ['HP245i'],
    ['HP246'],
  ],
  id: 'TO_HPU_Validation_HP_05',
};

//------------------------------------------------------------------------------

const tableHPU_Validation_HP_07 = {
  rows: [
    '<10 years- male',
    '<10 years- female',
    '10-19 years- male',
    '10-19 years- female',
    '20-29 years- male',
    '20-29 years- female',
    '30-39 years- male',
    '30-39 years- female',
    '40-49 years- male',
    '40-49 years- female',
    '50-59 years- male',
    '50-59 years- female',
    '60 + years male',
    '60 + years female',
  ],
  columns: ['Number Attended'],
  cells: [
    ['HP288'],
    ['HP289'],
    ['HP290'],
    ['HP291'],
    ['HP292a'],
    ['HP292b'],
    ['HP293a'],
    ['HP293b'],
    ['HP294a'],
    ['HP294b'],
    ['HP295a'],
    ['HP295b'],
    ['HP296'],
    ['HP297'],
  ],
  id: 'TO_HPU_Validation_HP_07',
};

//------------------------------------------------------------------------------

const tableHPU_Validation_HP_08_Sessions = {
  rows: [
    'Total Number of One on One Sessions Delivered',
    'Total Number of Group Sessions Delivered',
  ],
  columns: ['Number'],
  cells: [['HP299a'], ['HP323a']],
  id: 'TO_HPU_Validation_HP_08_Sessions',
};

//------------------------------------------------------------------------------

const tableCD_Validation_CD5 = {
  rows: [
    'Total Number of Health Promotion Sessions Delivered',
    'Total Number of Training Sessions Delivered',
  ],
  columns: ['Number'],
  cells: [['CD63'], ['CD63a']],
  id: 'TO_CD_Validation_CD5',
};

//------------------------------------------------------------------------------

const tableCD_Validation_CD6 = {
  rows: [
    'Shopkeeper - New',
    'Shopkeeper - Renewal',
    'Food Handler - New',
    'Food Handler - Renewal',
    'Total',
  ],
  columns: ['Number'],
  cells: buildSingleColumnTableCells({ prefix: 'CD', start: 65, end: 68, addColumnTotal: true }),
  id: 'TO_CD_Validation_CD6',
};

//------------------------------------------------------------------------------
// Table From Data Element Group Migrations
//------------------------------------------------------------------------------

const tCD_Validation_CD7Rows = [
  {
    category: 'Certificates Issued',
    rows: ['Male', 'Female', 'Totals'],
  },
  {
    category: 'Missionary',
    rows: ['Bahai Faith', 'LDS', 'Other', 'Totals'],
  },
  {
    category: 'Visa',
    rows: [
      'Tonga Immigration',
      'China',
      'Fiji',
      'India',
      'Israel',
      'Japan',
      'Malaysia',
      'Samoa (Apia and Pangopango)',
      'Thailand',
      'Other',
      'Totals',
    ],
  },
  {
    category: 'Employment',
    rows: [
      'Bankers (BSP, TDB)',
      'Army, Firemen, Wardens',
      'FWC Workers',
      'SBPD',
      'Sea Fearers',
      'Tonga Civil Servant (all government workers)',
      'Other',
      'Totals',
    ],
  },
];

const tCD_Validation_CD7Cols = ['Number'];

const tableCD_Validation_CD7 = {
  rows: tCD_Validation_CD7Rows,
  columns: tCD_Validation_CD7Cols,
  cells: [
    ['CD70'],
    ['CD71'],
    ['$rowCategoryColumnTotal'],
    [undefined],
    ['CD73'],
    ['CD74'],
    ['$rowCategoryColumnTotal'],
    ['CD75'],
    ['CD76'],
    ['CD77'],
    ['CD78'],
    ['CD79'],
    ['CD80'],
    ['CD81'],
    ['CD82'],
    ['CD83'],
    ['CD84'],
    ['$rowCategoryColumnTotal'],
    ['CD85'],
    ['CD84a'],
    ['CD86'],
    ['CD87'],
    ['CD88'],
    ['CD89'],
    ['CD90'],
    ['$rowCategoryColumnTotal'],
  ],
  id: 'TO_CD_Validation_CD7',
};

//------------------------------------------------------------------------------

const tHPU_Validation_HP_01Rows = [
  'Number Participated in Sport - Male',
  'Number Participated in Sport - Female',
  'Number Participated in Fitness - Male',
  'Number Participated in Fitness - Female',
];

const tHPU_Validation_HP_01Cols = [
  '<10 years',
  '10-19 years',
  '20-39 years',
  '40-59 years',
  '60 + years',
];

const HPU_Validation_MaleFemaleFormatFunctionBuilder = (start, prefix = 'HP') => {
  return (row, col) => {
    const genderIndexOffset = row % 2; // Female rows are always 2nd and have an offset of 1
    const rowBaseIndex = start + Math.floor(row / 2) * 2 * tHPU_Validation_HP_01Cols.length;
    const index = rowBaseIndex + col * 2 + genderIndexOffset;

    return `${prefix}${index}`;
  };
};

const tableHPU_Validation_HP_01 = {
  rows: tHPU_Validation_HP_01Rows,
  columns: tHPU_Validation_HP_01Cols,
  cells: build2dTableStringFormatCells(
    HPU_Validation_MaleFemaleFormatFunctionBuilder(8),
    [...Array(4).keys()],
    [...Array(5).keys()],
  ),
  id: 'TO_HPU_Validation_HP_01',
};

//------------------------------------------------------------------------------

const tHPU_Validation_HP_02Rows = [
  'Number Screened - Male',
  'Number Screened - Female',
  'Waist Circumference < 100 cm - Male',
  'Waist Circumference ≥ 100 cm - Male',
  'Waist Circumference <90 cm - Female',
  'Waist Circumference ≥ 90 cm Female',
  'Body Fat ≥ 30% - Male',
  'Body Fat ≥ 30% - Female',
  'Overweight (BMI 25 to 29.9) - Male',
  'Overweight (BMI 25 to 29.9) - Female',
  'Class 1 Obesity (BMI 30.0 to 34.9) - Male',
  'Class 1 Obesity (BMI 30.0 to 34.9) - Female',
  'Class 2 Obesity (BMI 35.0 to 39.9) - Male',
  'Class 2 Obesity (BMI 35.0 to 39.9) - Female',
  'Class 3 Obesity (BMI ≥ 40) - Male',
  'Class 3 Obesity (BMI ≥ 40) - Female',
  'Borderline Fasting Blood Sugar (6.1-7.0) - Male',
  'Borderline Fasting Blood Sugar (6.1-7.0) - Female',
  'High Fasting Blood Sugar (≥7.1) - Male',
  'High Fasting Blood Sugar (≥7.1) - Female',
  'Moderate High Blood Pressure (140-159/90-99) - Male',
  'Moderate High Blood Pressure (140-159/90-99) - Female',
  'Very High Blood Pressure (≥160/≥100) - Male',
  'Very High Blood Pressure (≥160/≥100) - Female',
  'Smokers - Male',
  'Smokers - Female',
  'Alcohol Drinkers - Male',
  'Alcohol Drinkers - Female',
  'Family History of NCD - Yes - Male',
  'Family History of NCD - Yes - Female',
  'Family History of NCD - No - Male',
  'Family History of NCD - No - Female',
  'Referrals - Male',
  'Referrals - Female',
  'Known Case - Yes - Male',
  'Known Case - Yes - Female',
  'Known Case - No - Male',
  'Known Case - No - Female',
];

const tHPU_Validation_HP_02Cols = [
  '<10 years',
  '10-19 years',
  '20-39 years',
  '40-59 years',
  '60 + years',
];

const tHPU_Validation_HP_02CellFunctionCols = [...Array(5).keys()];

const tableHPU_Validation_HP_02 = {
  rows: tHPU_Validation_HP_02Rows,
  columns: tHPU_Validation_HP_02Cols,
  cells: [
    ...build2dTableStringFormatCells(
      HPU_Validation_MaleFemaleFormatFunctionBuilder(35),
      [...Array(2).keys()],
      tHPU_Validation_HP_02CellFunctionCols,
    ),
    ...build2DTableCells({
      prefix: 'HP',
      numRows: 4,
      numCols: tHPU_Validation_HP_02Cols.length,
      startCell: 45,
    }),
    ...build2dTableStringFormatCells(
      HPU_Validation_MaleFemaleFormatFunctionBuilder(65),
      [...Array(28).keys()],
      tHPU_Validation_HP_02CellFunctionCols,
    ),
    ...build2dTableStringFormatCells(
      HPU_Validation_MaleFemaleFormatFunctionBuilder(1, 'HP_KnownYes'),
      [...Array(2).keys()],
      tHPU_Validation_HP_02CellFunctionCols,
    ),
    ...build2dTableStringFormatCells(
      HPU_Validation_MaleFemaleFormatFunctionBuilder(1, 'HP_KnownNo'),
      [...Array(2).keys()],
      tHPU_Validation_HP_02CellFunctionCols,
    ),
  ],
  id: 'TO_HPU_Validation_HP_02',
};

//------------------------------------------------------------------------------

const tHPU_Validation_HP_04AgeRows = [
  '10-19 years',
  '20-29 years',
  '30-39 years',
  '40-49 years',
  '50-59 years',
  '60 + years',
];

const tHPU_Validation_HP_04Rows = [
  {
    category: 'New Cases Registered for Quit Support',
    rows: tHPU_Validation_HP_04AgeRows,
  },
  {
    category: 'New Quitters',
    rows: tHPU_Validation_HP_04AgeRows,
  },
  {
    category: 'Number of Drop-Out Cases',
    rows: tHPU_Validation_HP_04AgeRows,
  },
  {
    category: 'Nicotine Replacement Therapy',
    rows: ['New Users', 'Discontinued'],
  },
];

const tHPU_Validation_HP_04Cols = ['Male', 'Female'];

const tableHPU_Validation_HP_04 = {
  rows: tHPU_Validation_HP_04Rows,
  columns: tHPU_Validation_HP_04Cols,
  cells: [
    ['HP217', 'HP218'],
    ['HP219a', 'HP219b'],
    ['HP220a', 'HP220b'],
    ['HP221a', 'HP221b'],
    ['HP222a', 'HP222b'],
    ['HP223', 'HP224'],
    ['HP225', 'HP226'],
    ['HP227a', 'HP227b'],
    ['HP228a', 'HP228b'],
    ['HP229a', 'HP229b'],
    ['HP230a', 'HP230b'],
    ['HP231', 'HP232'],
    ['HP232a', 'HP232b'],
    ['HP232ca', 'HP232cb'],
    ['HP232da', 'HP232db'],
    ['HP232ea', 'HP232eb'],
    ['HP232fa', 'HP232fb'],
    ['HP232g', 'HP232h'],
    ...build2DTableCells({
      prefix: 'HP',
      numRows: tHPU_Validation_HP_04Rows[3].rows.length,
      numCols: tHPU_Validation_HP_04Cols.length,
      startCell: 233,
    }),
  ],
  id: 'TO_HPU_Validation_HP_04',
};

//------------------------------------------------------------------------------

const tHPU_Validation_HP_06Rows = [
  {
    category: 'Total Number of Restricted Public Areas Inspected',
    rows: ['Total Number of Restricted Public Areas Inspected'],
  },
  {
    category: 'Number of Areas Non-Compliant',
    rows: [
      'Non-Compliant: Shops',
      'Non-Compliant: Restaurants',
      'Non-Compliant: Bars',
      'Non-Compliant: Kava Clubs',
      'Non-Compliant: Schools',
      'Non-Compliant: Sports Areas',
      'Non-Compliant: Public Transportation',
      'Non-Compliant: Other',
      'Totals',
    ],
  },
  {
    category: 'Number of People Given Warning on the Spot at',
    rows: [
      'Warning on the spot: Workplace',
      'Warning on the spot: School',
      'Warning on the spot: Church Halls',
      'Warning on the spot: Other',
      'Totals',
    ],
  },
  {
    category: 'Number of People Fined on the Spot at',
    rows: [
      'Fined on the spot: Workplace',
      'Fined on the spot: School',
      'Fined on the spot: Church Halls',
      'Fined on the spot: Other',
      'Totals',
    ],
  },
  {
    category: 'Miscellaneous',
    rows: [
      'Number of Reported Complaints',
      'Number of Complaints Followed up with Warning',
      'Number of Complaints Followed up with Prosecution',
      'Number of Stop Smoking Signs Distributed',
      'Number of Smoking Kills Signs Distributed',
    ],
  },
];

const tHPU_Validation_HP_06Cols = ['Number'];

const tableHPU_Validation_HP_06 = {
  rows: tHPU_Validation_HP_06Rows,
  columns: tHPU_Validation_HP_06Cols,
  cells: [
    ['HP253'],
    ['HP254'],
    ['HP255'],
    ['HP256'],
    ['HP257'],
    ['HP258'],
    ['HP259'],
    ['HP260'],
    ['HP261'],
    ['$rowCategoryColumnTotal'],
    ['HP263'],
    ['HP264'],
    ['HP265'],
    ['HP266'],
    ['$rowCategoryColumnTotal'],
    ['HP268'],
    ['HP269'],
    ['HP270'],
    ['HP271'],
    ['$rowCategoryColumnTotal'],
    ['HP273'],
    ['HP274'],
    ['HP275'],
    ['HP276'],
    ['HP277'],
  ],
  id: 'TO_HPU_Validation_HP_06',
};

//------------------------------------------------------------------------------

const tHPU_Validation_HP_08AgeRows = [
  '10-19 years',
  '20-29 years',
  '30-39 years',
  '40-49 years',
  '50-59 years',
  '60 + years',
];

const tHPU_Validation_HP_08Rows = [
  {
    category: 'Group Participants: Completed',
    rows: tHPU_Validation_HP_08AgeRows,
  },
  {
    category: 'One on One Participants: Completed',
    rows: tHPU_Validation_HP_08AgeRows,
  },
  {
    category: 'Group Participants: Drop-outs',
    rows: tHPU_Validation_HP_08AgeRows,
  },
  {
    category: 'One on One Participants: Drop-outs',
    rows: tHPU_Validation_HP_08AgeRows,
  },
  {
    category: 'Group Participants: New',
    rows: tHPU_Validation_HP_08AgeRows,
  },
  {
    category: 'One on One Participants: New',
    rows: tHPU_Validation_HP_08AgeRows,
  },
  {
    category: 'Group Participants: Total',
    rows: tHPU_Validation_HP_08AgeRows,
  },
  {
    category: 'One on One Participants: Total',
    rows: tHPU_Validation_HP_08AgeRows,
  },
];

const tHPU_Validation_HP_08CellFunctionRows = [...Array(6).keys()];
const tHPU_Validation_HP_08CellFunctionCols = [...Array(2).keys()];

const tHPU_Validation_HP_08CellFormatFunctionBuilder = start => {
  return (row, col) => {
    if (row < 3) {
      return `HP${start + row}${col < 1 ? 'a' : 'b'}`;
    }
    if (row < 4) {
      return `HP${start + row}a_${col < 1 ? 'm' : 'f'}`;
    }
    if (row < 5) {
      return `HP${start + (row - 1)}b_${col < 1 ? 'm' : 'f'}`;
    }

    return `HP${start + (col < 1 ? row - 1 : row)}`;
  };
};

const tHPU_Validation_HP_08Cols = ['Male', 'Female'];

const tableHPU_Validation_HP_08 = {
  rows: tHPU_Validation_HP_08Rows,
  columns: tHPU_Validation_HP_08Cols,
  cells: [
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(335),
      tHPU_Validation_HP_08CellFunctionRows,
      tHPU_Validation_HP_08CellFunctionCols,
    ),
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(311),
      tHPU_Validation_HP_08CellFunctionRows,
      tHPU_Validation_HP_08CellFunctionCols,
    ),
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(341),
      tHPU_Validation_HP_08CellFunctionRows,
      tHPU_Validation_HP_08CellFunctionCols,
    ),
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(317),
      tHPU_Validation_HP_08CellFunctionRows,
      tHPU_Validation_HP_08CellFunctionCols,
    ),
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(329),
      tHPU_Validation_HP_08CellFunctionRows,
      tHPU_Validation_HP_08CellFunctionCols,
    ),
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(305),
      tHPU_Validation_HP_08CellFunctionRows,
      tHPU_Validation_HP_08CellFunctionCols,
    ),
    ['HP323aa', 'HP323ab'],
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(323),
      [1, 2, 3, 4, 5],
      tHPU_Validation_HP_08CellFunctionCols,
    ),
    //---------------------
    ['HP299b', 'HP299c'],
    ...build2dTableStringFormatCells(
      tHPU_Validation_HP_08CellFormatFunctionBuilder(299),
      [1, 2, 3, 4, 5],
      tHPU_Validation_HP_08CellFunctionCols,
    ),
  ],
  id: 'TO_HPU_Validation_HP_08',
};

//------------------------------------------------------------------------------

const tHPU_Validation_HP_09AgeRows = [
  '10-19 years',
  '20-29 years',
  '30-39 years',
  '40-49 years',
  '50-59 years',
  '60 + years',
];

const tHPU_Validation_HP_09Rows = [
  {
    category: 'Currenty Receiving Counselling',
    rows: tHPU_Validation_HP_09AgeRows,
  },
  {
    category: 'Quitters',
    rows: tHPU_Validation_HP_09AgeRows,
  },
  {
    category: 'NRT Users',
    rows: ['NRT Users'],
  },
];

const tHPU_Validation_HP_09Cols = ['Male', 'Female'];

const tableHPU_Validation_HP_09 = {
  rows: tHPU_Validation_HP_09Rows,
  columns: tHPU_Validation_HP_09Cols,
  cells: [
    ['HP348', 'HP349'],
    ['HP350m', 'HP350f'],
    ['HP351m', 'HP351f'],
    ['HP352m', 'HP352f'],
    ['HP353m', 'HP353f'],
    ['HP354', 'HP355'],
    ['HP356', 'HP357'],
    ['HP358m', 'HP358f'],
    ['HP359m', 'HP359f'],
    ['HP360m', 'HP360f'],
    ['HP361m', 'HP361f'],
    ['HP362', 'HP363'],
    ['HP364', 'HP365'],
  ],
  id: 'TO_HPU_Validation_HP_09',
};

//------------------------------------------------------------------------------

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
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_04_New_Calls)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_05)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_07)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_08_Sessions)}
    ${convertToTableOfDataValuesSql(tableCD_Validation_CD5)}
    ${convertToTableOfDataValuesSql(tableCD_Validation_CD6)}

    ${convertToTableOfDataValuesSql(tableCD_Validation_CD7)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_01)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_02)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_04)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_06)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_08)}
    ${convertToTableOfDataValuesSql(tableHPU_Validation_HP_09)}
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
