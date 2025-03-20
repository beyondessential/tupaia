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

const DASHBOARD_GROUP_CODES = ['UNFPA_Project'];

const REPORT_ID = 'UNFPA_Region_Facilities_offering_services_At_Least_1_Matrix';

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

const DATA_BUILDER_CONFIG = {
  rows: Object.values(dataElementToName),
  cells: Object.keys(dataElementToName).map(dataElement =>
    Object.keys(countryCodeToName).map(countryCode => buildCell(dataElement, countryCode)),
  ),
  columns: Object.values(countryCodeToName),
  entityAggregation: {
    aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    dataSourceEntityType: 'facility',
    aggregationEntityType: 'country',
  },
};

const VIEW_JSON = {
  name: '% of facilities with at least 1 staff member trained in SRH service provision',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'tableOfCalculatedValues',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
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
    "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
