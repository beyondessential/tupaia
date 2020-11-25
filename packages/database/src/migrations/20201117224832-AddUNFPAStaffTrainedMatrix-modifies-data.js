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
/**
 * 
 * 
  "dataBuilders": {
    "countFacilitiesSurveyed": {
      "dataBuilder": "sumValuesPerQuarterByOrgUnit",
      "dataBuilderConfig": {
        "dataElementCodes": [
          "RHS1UNFPA03"
        ],
        "entityAggregation": {
          "aggregationType": "COUNT_PER_PERIOD_PER_ORG_GROUP",
          "dataSourceEntityType": "facility",
          "aggregationEntityType": "country"
        }
      }
    },
    "sumFacilitiesWithServicesAvailable": {
      "dataBuilder": "sumValuesPerQuarterByOrgUnit",
      "dataBuilderConfig": {
        "dataElementCodes": [
          "RHS4UNFPA809"
        ],
        "entityAggregation": {
          "aggregationType": "COUNT_PER_PERIOD_PER_ORG_GROUP",
          "aggregationConfig": {
            "condition": {
              "value": 0,
              "operator": ">"
            }
          },
          "dataSourceEntityType": "facility",
          "aggregationEntityType": "country"
        }
      }
    }
  }
}
 */
const dataElementToName = {
  RHS4UNFPA809: 'Family_Planning',
  RHS2UNFPA292: 'SGBV',
  RHS3UNFPA5410: 'Delivery',
  $dataDate: 'Date_Of_Data',
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

const DASHBOARD_GROUP_CODES = ['UNFPA_Project'];

const REPORT_ID = 'UNFPA_Region_Facilities_offering_services_At_Least_1_Matrix';

const buildDataDateCell = (countryCode, key) => {
  return {
    key,
    operator: 'FORMAT',
    dataElement: 'RHS1UNFPA03',
    format: `This is date for ${countryCode}`,
  };
};

const buildCell = (dataElement, countryCode) => {
  const key = `${countryCodeToName[countryCode]}_${dataElementToName[dataElement]}`;

  if (dataElement === '$dataDate') return buildDataDateCell(countryCode, key);

  return {
    key,
    operator: 'FRACTION_AND_PERCENTAGE',
    operands: [{ dataValues: [dataElement] }, { dataValues: ['RHS1UNFPA03'] }],
    filter: {
      organisationUnit: countryCode,
    },
  };
};

const DATA_BUILDER_CONFIG = {
  rows: ['Family Planning', 'Delivery', 'SGBV Services', 'Data Collection Date'],
  cells: Object.keys(dataElementToName).map(dataElement =>
    Object.keys(countryCodeToName).map(countryCode => buildCell(dataElement, countryCode)),
  ),
  columns: Object.values(countryCodeToName),
  entityAggregation: {
    aggregationType: 'COUNT_PER_ORG_GROUP',
    aggregationConfig: {
      condition: {
        // Incredibly hacky way to use the same entityAggregation for both the numerator and denominator.
        // In the denominator case, we allow any string with a letter in it, which is all responses currently.
        // In the numerator case, we only count values more than 0.
        // TODO: Improve/remove this
        operator: 'or',
        value: [
          {
            value: 0,
            operator: '>',
          },
          {
            value: '[a-zA-Z]+',
            operator: 'regex',
          },
        ],
      },
    },
    dataSourceEntityType: 'facility',
    aggregationEntityType: 'country',
  },
  aggregationType: 'MOST_RECENT',
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
