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
  id: 'Samoa_Covid_Number_Of_Passengers_By_Flight',
  dataBuilder: 'totalNumOfPassengerByFlightDate',
  dataBuilderConfig: {
    programCode: 'SC1QMIA',
    entityAggregation: { dataSourceEntityType: 'individual' },
  },
  viewJson: {
    name: '	Number of Passengers per Flight',
    type: 'chart',
    chartType: 'bar',
    periodGranularity: 'day',
    presentationOptions: {
      hideAverage: true,
    },
    chartConfig: {
      value: {
        label: 'Number of People',
      },
    },
    renderLegendForOneItem: true,
  },
  dataServices: [],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', dashboardReport);
  await addReportToGroups(db, dashboardReport.id, ['WS_Covid_Samoa_Country']);
};

exports.down = async function (db) {
  await deleteReport(db, dashboardReport.id);
  await removeReportFromGroups(db, dashboardReport.id, ['WS_Covid_Samoa_Country']);
};

exports._meta = {
  version: 1,
};
