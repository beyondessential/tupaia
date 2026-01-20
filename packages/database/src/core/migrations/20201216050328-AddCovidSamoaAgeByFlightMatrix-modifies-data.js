'use strict';

import { insertObject, addReportToGroups } from '../utilities';

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

const DASHBOARD_REPORT = {
  id: 'Samoa_Covid_Age_Demo_Per_Flight',
  dataBuilder: 'valueAndPercentageByAgeByFlightDate',
  dataBuilderConfig: {
    programCode: 'SC1QMIA',
    entityAggregation: { dataSourceEntityType: 'case' },
  },
  viewJson: {
    name: 'Demographics of individuals in quarantine: Age (COVID-19)',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  },
  dataServices: [],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await addReportToGroups(db, DASHBOARD_REPORT.id, ['WS_Covid_Samoa_Country']);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
