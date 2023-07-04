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

const REPORT_ID = 'UNFPA_Raw_Data_Reproductive_Health_Facility';
const DATA_BUILDER_CONFIG = {
  surveys: [
    {
      code: 'RHFSC',
      name: 'Reproductive Health Facility Spot Check',
    },
  ],
};

const VIEW_JSON = {
  name: 'Download Reproductive Health Facility Spot Check Raw Data',
  type: 'view',
  viewType: 'dataDownload',
  periodGranularity: 'month',
};

const DASHBOARD_REPORT = {
  id: REPORT_ID,
  dataBuilder: 'rawDataDownload',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

// Tonga, Kiribati, Fiji, Marshall Islands, FSM, Solomon Islands, Vanuatu, Samoa
const COUNTRY_ORG_UNITS = ['TO', 'KI', 'FJ', 'SB', 'VU', 'WS', 'MH', 'FM'];

const BASE_CODE = '_UNFPA_Raw_Data_Downloads_Country';

const DASHBOARD_GROUP_CONFIG = {
  organisationLevel: 'Country',
  userGroup: 'UNFPA',
  dashboardReports: `{${REPORT_ID}}`,
  name: 'UNFPA Raw Data Downloads',
  projectCodes: '{unfpa}',
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
