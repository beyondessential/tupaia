'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const dataBuilderConfig = {
  dataElementCodes: ['FETPNG20Data_002'],
  valuesOfInterest: ['Female', 'Male'],
  entityAggregation: {
    dataSourceEntityType: 'individual',
  },
};
const viewJson = {
  name: 'FETP Graduates by Sex',
  type: 'chart',
  chartType: 'pie',
  valueType: 'number',
};
const dataServices = [
  {
    isDataRegional: false,
  },
];

const report = {
  id: 'PG_FETP_graduates_by_sex',
  dataBuilder: 'countByAllDataValues',
  dataBuilderConfig,
  viewJson,
  dataServices,
};

const dashboardGroupIds = [
  'PG_FETP_Country_Public',
  'PG_FETP_District_Public',
  'PG_FETP_SubDistrict_Public',
];

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', report);

  return db.runSql(`
    update "dashboardGroup"
    set "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
    where "code" IN (${arrayToDbString(dashboardGroupIds)});
`);
};

exports.down = function (db) {
  return db.runSql(`
    delete from "dashboardReport" where id = '${report.id}';

    update "dashboardGroup"
    set "dashboardReports" = array_remove("dashboardReports", '${report.id}')
    where "code" IN (${arrayToDbString(dashboardGroupIds)});
  `);
};

exports._meta = {
  version: 1,
};
