'use strict';

import { generateId, insertObject } from '../utilities';

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

const reports = [
  {
    id: 'Laos_EOC_Malaria_Cases_By_Week_District',
    entityType: 'district',
    groupCode: 'LAOS_EOC_Malaria_District',
  },
  {
    id: 'Laos_EOC_Malaria_Cases_By_Week_Sub_District',
    entityType: 'sub_district',
    groupCode: 'LAOS_EOC_Malaria_Sub_District',
  },
];

const buildReportConfig = (id, entityType) => ({
  id,
  dataBuilder: 'countEventsPerPeriod',
  dataBuilderConfig: {
    programCode: ['Malaria_Case_Reporting'],
    dataElement: 'Total_Positive_Malaria_Cases',
    entityAggregation: {
      dataSourceEntityType: 'facility',
      aggregationEntityType: entityType,
    },
    periodType: 'week',
  },
  viewJson: {
    name: 'Total Malaria Cases by Week',
    type: 'chart',
    chartType: 'bar',
    periodGranularity: 'week',
    defaultTimePeriod: {
      end: {
        unit: 'week',
        offset: 0,
      },
      start: {
        unit: 'week',
        offset: -52,
      },
    },
    presentationOptions: { hideAverage: true },
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
});

exports.up = async function (db) {
  await Promise.all(
    reports.map(report =>
      insertObject(db, 'dashboardReport', buildReportConfig(report.id, report.entityType)),
    ),
  );
  await Promise.all(
    reports.map(report =>
      db.runSql(`
        update "dashboardGroup" set "dashboardReports" = '{${report.id}}' || "dashboardReports" 
        where code = '${report.groupCode}';
      `),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    reports.map(report =>
      db.runSql(`
        update "dashboardGroup" set "dashboardReports" = array_remove("dashboardReports", '${report.id}')
        where code = '${report.groupCode}';

        delete from "dashboardReport" where "id" = '${report.id}';
      `),
    ),
  );
};

exports._meta = {
  version: 1,
};
