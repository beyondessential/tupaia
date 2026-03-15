'use strict';

import { updateValues } from '../utilities';

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

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}

const dashboardReportIds = [
  { id: 'UNFPA_Priority_Medicines_SOH_Project', code: 'SOH' },
  { id: 'UNFPA_Priority_Medicines_AMC_Project', code: 'AMC' },
  { id: 'UNFPA_Priority_Medicines_MOS_Project', code: 'MOS' },
  { id: 'UNFPA_Priority_Medicines_SOH', code: 'SOH' },
  { id: 'UNFPA_Priority_Medicines_AMC', code: 'AMC' },
  { id: 'UNFPA_Priority_Medicines_MOS', code: 'MOS' },
];

const rows = [
  {
    name: 'Priority Medicines for Women',
    cells: [
      '555c04bf',
      '4790d43e',
      '51f324bf',
      '53d544bf',
      '53ea14bf',
      '398ac4bf',
      '51b474bf',
      '51ce64bf',
      '4576d4bf',
      '457bf4bf',
      '458134bf',
      '4fb394bf',
      '3659b4bf',
      '3654d4bf',
      '4366a4bf',
      '4346e4bf',
      '4fd604bf',
      '51f324bf',
      '50d804bf',
      '373ad4bf',
      '373f64bf',
      '373654bf',
      '38b814bf',
      '3827b4bf',
      '382424bf',
      '3e40b4bf',
      '53fc34bf',
      '3eb84c00',
      'b3044cdc',
      '47d1743e',
      '0a820c00',
      '46ca843e',
      '47d8e43e',
      '9ed445dd',
    ],
  },
  {
    name: 'Priority Medicines for Children Under 5 Years of Age',
    cells: [
      '368c74bf',
      '3692b4bf',
      '367c44bf',
      '368674bf',
      '3659b4bf',
      '3654d4bf',
      '38df44bf',
      '38db24bf',
      '4346e4bf',
      '552344bf',
      '5517c4bf',
      '551c34bf',
      '551ff4bf',
      '677cf4bf',
      '3659b4bf',
      '38df44bf',
      '38db24bf',
      '4346e4bf',
      '4366a4bf',
      '556ce4bf',
      '557054bf',
      '471474bf',
      '0a820c00',
      '47f0c43e',
      '47f8b43e',
      '535b54bf',
      '536054bf',
      '536f54bf',
      '537ec4bf',
      '538e24bf',
      '52f844bf',
      '533734bf',
      'ab6105dd',
      '533194bf',
      '532904bf',
      '534684bf',
      '534b94bf',
      '536554bf',
      '536a64bf',
      '537474bf',
      '5379b4bf',
      '559794bf',
      'bbfcf518',
    ],
  },
  {
    name: 'Priority Medicines for Child Health and Survival',
    cells: [
      '403004bf',
      '403354bf',
      '403694bf',
      '471f243e',
      '4726043e',
      '615374bf',
      '614ce4bf',
      '615054bf',
      '5f0c14bf',
      '5ee7e4bf',
      '5f11b4bf',
      '292735dd',
      '469064bf',
      '468a44bf',
      '47c2c43e',
      '47ca443e',
      '3f6604bf',
      '3f6ad4bf',
      '471f243e',
      '03beecaf',
      '642184bf',
      '9716ccaf',
      '383444bf',
      '394894bf',
      '373ad4bf',
      '3e40b4bf',
      '5dadc4bf',
      '5db3a4bf',
    ],
  },
  {
    name: 'Child and Maternal Health',
    cells: [
      '566bceec',
      '46cfdeec',
      '199ffeec',
      '36d0c4bf',
      '36d5b4bf',
      '36df14bf',
      '3a6c44bf',
      '60fa34bf',
      '399514bf',
    ],
  },
  {
    name: 'Maternal Health Products (UNFPA)',
    cells: [
      '555c04bf',
      '4790d43e',
      '51b474bf',
      '51ce64bf',
      '41e9d4bf',
      '41f354bf',
      '484444bf',
      '484d54bf',
    ],
  },
  {
    name: 'Contraceptives',
    cells: [
      '3b3444bf',
      'a162942e',
      'bf4be518',
      '402924bf',
      '47d584bf',
      '3ff944bf',
      'd2d28620',
      '47fb04bf',
      '47fe44bf',
      '53d014bf',
      '4752843e',
      '542a34bf',
      '4718f43e',
      '3b3994bf',
    ],
  },
  {
    name: 'Emergency Kits',
    cells: [
      '49d9842e',
      '7e67742e',
      'b26e342e',
      'e1e8342e',
      'a97d742e',
      'dd7b542e',
      '088a142e',
      '383e142e',
      'bca6342e',
      '756e542e',
      'ae11242e',
      'e1d4a42e',
      '1193e42e',
    ],
  },
];

const newOrder = [
  5, // 'Contraceptives',
  4, // 'Maternal Health Products (UNFPA)',
  0, // 'Priority Medicines for Women',
  1, // 'Priority Medicines for Children Under 5 Years of Age',
  2, // 'Priority Medicines for Child Health and Survival',
  3, // 'Child and Maternal Health',
  6, // 'Emergency Kits',
];

const previousOrder = [0, 1, 2, 3, 4, 5, 6];

async function reorderRows(db, order) {
  for (const { id, code } of dashboardReportIds) {
    const orderWithName = order.map(e => rows[e].name);
    const dashboardReport = await getDashboardReportById(db, id);

    // Reorder the rows
    const newOrderRows = [];
    dashboardReport.dataBuilderConfig.rows.forEach(element => {
      const index = orderWithName.findIndex(e => element.category === e);
      newOrderRows[index] = element;
    });
    dashboardReport.dataBuilderConfig.rows = newOrderRows;

    // Reorder the cells
    const newCells = order.flatMap(e => {
      const cells = rows[e].cells.map(cell => `${code}_${cell}`);
      return cells;
    });
    dashboardReport.dataBuilderConfig.cells = newCells;

    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, id);
  }
}
exports.up = async function (db) {
  await reorderRows(db, newOrder);
};

exports.down = async function (db) {
  await reorderRows(db, previousOrder);
};

exports._meta = {
  version: 1,
};
