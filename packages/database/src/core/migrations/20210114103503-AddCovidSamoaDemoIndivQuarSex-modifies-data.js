'use strict';

import {
  insertObject,
  addReportToGroups,
  deleteReport,
  removeReportFromGroups,
} from '../utilities';

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

const dashboardReport = {
  id: 'Samoa_Covid_Demo_Indiv_Sex_Per_Flight',
  dataBuilder: 'valueAndPercentageByDataValueByFlightDate',
  dataBuilderConfig: {
    programCode: 'SC1QMIA',
    rows: ['Female', 'Male'],
    cells: [
      // 'QMIA028', Flight
      ['QMIA009', 'Female'],
      ['QMIA009', 'Male'],
    ],
    entityAggregation: { dataSourceEntityType: 'case' },
  },
  viewJson: {
    name: 'Demographics of Individuals in Quarantine: Sex (COVID-19)',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  },
  dataServices: [],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', dashboardReport);

  await addReportToGroups(db, dashboardReport.id, ['WS_Covid_Samoa_Country']);

  return null;
};

exports.down = async function (db) {
  await deleteReport(db, dashboardReport.id);

  await removeReportFromGroups(db, dashboardReport.id, ['WS_Covid_Samoa_Country']);

  return null;
};

exports._meta = {
  version: 1,
};
