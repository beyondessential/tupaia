'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

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

const DASHBOARD_GROUP_CODES = ['Tonga_Communicable_Diseases_National'];

const REPORT = {
  id: 'TO_CD_Isolation_Admissions_Initial_Diagnosis_Stacked_Bar',
  dataBuilder: 'countEventsPerPeriodByDataValue',
  dataBuilderConfig: {
    programCode: 'CD4',
    dataElement: 'CD4_007',
    periodType: 'month',
    optionSetCode: 'CD4_Diagnosis_Abscess.Carbuncle.more',
  },
  viewJson: {
    name: 'Isolation Ward Admissions',
    type: 'chart',
    chartType: 'bar',
    chartConfig: {
      $all: {
        stackId: 1,
      },
    },
    renderLegendForOneItem: true,
    periodGranularity: 'month',
  },
  dataServices: [
    {
      isDataRegional: false,
    },
  ],
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
     WHERE
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
   `);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
     WHERE
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
   `);
};

exports._meta = {
  version: 1,
};
