'use strict';

import { insertObject } from '../utilities';

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

const REPORT = {
  id: 'IPC_commodity_availability',
  dataBuilder: 'tableOfDataValues',
  dataBuilderConfig: {
    rows: [
      'How many ICU beds does this facility have?',
      'How many isolation beds does this facility have?',
      'Total number of disposable gloves in stock at this facility',
      'Total number of face masks in stock at this facility',
      'Total number of paracetamol tablets in stock at this facility',
      'Total amount of hand sanitizer (in litres)',
    ],
    columns: ['Number'],
    cells: [
      ['COVID-19FacAssTool_21'],
      ['COVID-19FacAssTool_22'],
      ['COVID-19FacAssTool_14'],
      ['COVID-19FacAssTool_15'],
      ['COVID-19FacAssTool_16'],
      ['COVID-19FacAssTool_13'],
    ],
  },
  viewJson: {
    name: 'IPC commodity availability',
    showPeriodRange: 'all',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  },
};
const DASHBOARD_GROUP = {
  organisationLevel: 'Facility',
  userGroup: 'COVID-19',
  organisationUnitCode: 'TO',
  dashboardReports: `{${REPORT.id}}`,
  name: 'COVID-19',
  code: 'TO_Covid_Facility',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';`);
  await db.runSql(`DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP.code}';`);
};

exports._meta = {
  version: 1,
};
