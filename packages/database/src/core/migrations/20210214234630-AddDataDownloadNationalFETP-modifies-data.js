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

const SURVEY_CODE = 'FGDS';
const BASE_CODE = '_FETP_Raw_Data_Downloads_Country';
const REPORT_ID = 'FETP_Raw_Data_Graduate_Survey';

// PNG, Solomon Islands
const COUNTRY_ORG_UNITS = ['SB', 'PG'];

const dataBuilderConfig = {
  surveys: [
    {
      name: 'FETP Graduate Data Survey',
      code: SURVEY_CODE,
    },
  ],
  exportDataBuilder: {
    dataBuilder: 'rawDataValues',
    dataBuilderConfig: {
      skipHeader: false,
      surveysConfig: {
        [SURVEY_CODE]: {
          entityAggregation: {
            dataSourceEntityType: 'individual',
          },
        },
      },
    },
  },
};

const viewJson = {
  name: 'Download FETP Fellows Data Collection',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'year',
};

const DASHBOARD_REPORT = {
  id: REPORT_ID,
  dataBuilder: 'surveyDataExport',
  dataBuilderConfig,
  viewJson,
};

const DASHBOARD_GROUP_CONFIG = {
  organisationLevel: 'Country',
  userGroup: 'Admin',
  dashboardReports: `{${REPORT_ID}}`,
  name: 'FETP Raw Data Downloads',
  projectCodes: '{fetp}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', DASHBOARD_REPORT);

  await Promise.all(
    COUNTRY_ORG_UNITS.map(orgUnit => {
      return insertObject(db, 'dashboardGroup', {
        ...DASHBOARD_GROUP_CONFIG,
        code: `${orgUnit}${BASE_CODE}`,
        organisationUnitCode: `${orgUnit}`,
      });
    }),
  );
};
exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_ID}';

    DELETE FROM "dashboardGroup"
    WHERE code IN (${arrayToDbString(COUNTRY_ORG_UNITS.map(orgUnit => `${orgUnit}${BASE_CODE}`))});
  `);
};
exports._meta = {
  version: 1,
};
