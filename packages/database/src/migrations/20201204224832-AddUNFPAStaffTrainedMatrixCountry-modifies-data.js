'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';

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

const dataElementToName = {
  RHS4UNFPA809: 'Family Planning',
  RHS3UNFPA5410: 'Delivery',
  RHS2UNFPA292: 'SGBV Services',
  $dataDate: 'Data Collection Date',
};

const countryCodeToName = {
  FJ: 'Fiji',
  FM: 'FSM',
  KI: 'Kiribati',
  MH: 'Marshall Islands',
  WS: 'Samoa',
  SB: 'Solomon Islands',
  TO: 'Tonga',
  VU: 'Vanuatu',
};

const countryCodeToDate = {
  FJ: 'Q3 2019',
  FM: 'Q4 2018',
  KI: 'Q3 2019',
  MH: 'Q4 2018',
  WS: 'Q4 2018',
  SB: 'N/A',
  TO: 'Q3 2019',
  VU: 'N/A',
};

const BASE_REPORT_ID = 'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix';

const buildDataDateCell = (countryCode, key) => {
  return {
    key,
    operator: 'STATIC',
    value: countryCodeToDate[countryCode],
    noDataValue: 'N/A',
    dataElement: 'RHS1UNFPA03',
    filter: {
      organisationUnit: countryCode,
    },
  };
};

const buildCell = (dataElement, countryCode) => {
  const key = `${countryCodeToName[countryCode]}_${dataElementToName[dataElement].replace(
    / /g,
    '_',
  )}`;
  if (dataElement === '$dataDate') return buildDataDateCell(countryCode, key);

  return {
    key,
    operator: 'FRACTION_AND_PERCENTAGE',
    operands: [
      {
        aggregationType: 'COUNT',
        dataValues: [dataElement],
        aggregationConfig: {
          countCondition: { operator: '>', value: 0 },
        },
      },
      { aggregationType: 'COUNT', dataValues: ['RHS1UNFPA03'] },
    ],
    filter: {
      organisationUnit: countryCode,
    },
  };
};

const buildDataBuilderConfig = countryCode => ({
  rows: Object.values(dataElementToName),
  cells: Object.keys(dataElementToName).map(dataElement => [buildCell(dataElement, countryCode)]),
  columns: [countryCode],
  entityAggregation: {
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    dataSourceEntityType: 'facility',
    aggregationEntityType: 'country',
  },
});

const VIEW_JSON = {
  name: '% of facilities with at least 1 staff member trained in SRH service provision',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
};

const buildReport = countryCode => ({
  id: `${BASE_REPORT_ID}_${countryCode}`,
  dataBuilder: 'tableOfCalculatedValues',
  dataBuilderConfig: buildDataBuilderConfig(countryCode),
  viewJson: VIEW_JSON,
});

const addReport = async (db, countryCode) => {
  const DASHBOARD_GROUP_CODES = [`${countryCode}_Unfpa_Country`];
  const report = buildReport(countryCode);

  await insertObject(db, 'dashboardReport', report);
  return db.runSql(`
     UPDATE
      "dashboardGroup"
    SET
       "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

const deleteReport = async (db, countryCode) => {
  const DASHBOARD_GROUP_CODES = [`${countryCode}_Unfpa_Country`];
  const reportId = `${BASE_REPORT_ID}_${countryCode}`;

  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${reportId}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
    "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.up = async function (db) {
  for (const countryCode of Object.keys(countryCodeToName)) {
    await addReport(db, countryCode);
  }
};

exports.down = async function (db) {
  for (const countryCode of Object.keys(countryCodeToName)) {
    await deleteReport(db, countryCode);
  }
};

exports._meta = {
  version: 1,
};
