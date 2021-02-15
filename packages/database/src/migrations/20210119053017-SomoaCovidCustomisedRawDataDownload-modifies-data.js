'use strict';

import { insertObject } from '../utilities/migration';

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

const dashboardReportCode = 'WS_Covid_Samoa_Country';
const surveyCode = 'SC1QMIA';
const newDashboardReport = {
  id: 'Samoa_Covid_Customised_Raw_Data_Download',
  dataBuilder: 'surveyDataExport',
  dataBuilderConfig: {
    surveys: [
      {
        code: surveyCode,
        name: 'Initial Quarantine Monitoring',
      },
    ],
    exportDataBuilder: {
      dataBuilder: 'rawDataValues',
      dataBuilderConfig: {
        skipHeader: false,
        surveysConfig: {
          [surveyCode]: {
            entityAggregation: {
              dataSourceEntityType: 'individual',
            },
            entityIdToNameElements: ['QMIA029'],
          },
        },
        transformations: [
          {
            type: 'transposeMatrix',
          },
        ],
      },
    },
  },
  viewJson: {
    name: 'COVID-19 Customised Raw Data Download',
    type: 'view',
    viewType: 'dataDownload',
    periodGranularity: 'day',
  },
};
async function deleteReport(db, reportId) {
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = '${reportId}';
  `);
}
function removeReportFromGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}

function addReportToGroups(db, reportId, groupCodes) {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{"${reportId}"}'
    WHERE
      "code" IN (${groupCodes.map(code => `'${code}'`).join(',')});
  `);
}

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', newDashboardReport);
  await addReportToGroups(db, newDashboardReport.id, [dashboardReportCode]);
};

exports.down = async function (db) {
  await deleteReport(db, newDashboardReport.id);
  await removeReportFromGroups(db, newDashboardReport.id, [dashboardReportCode]);
};

exports._meta = {
  version: 1,
};
