'use strict';

import { insertObject, removeArrayValue } from '../utilities';
import { addArrayValue, arrayToDbString } from '../utilities/migration';

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

async function deleteReport(db, reportId) {
  return db.runSql(`
    DELETE FROM
      "dashboardReport"
    WHERE
      "id" = '${reportId}';
  `);
}

const countryCodes = ['FJ', 'FM', 'MH', 'WS', 'TO', 'KI', 'SB', 'VU'];

const facilityLevelDashboardReportConfig = {
  id: 'RH_Products_Stock_Availability_HFRSA_And_Spot_Check_Survey_Data',
  dataBuilder: 'tableOfValuesPerPeriod',
  dataBuilderConfig: {
    rows: [
      'Male condoms',
      'Female condoms',
      'Combined oral contraceptive',
      'Progesterone only pill',
      'Injectable contraceptives',
      'IUDs',
      'Implant contraceptives',
      'Emergency contraceptives',
    ],
    cells: [
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1207',
        },
      ],
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1220',
        },
      ],
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1233',
        },
      ],
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1246',
        },
      ],
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1259',
        },
      ],
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1272',
        },
      ],
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1285',
        },
      ],
      [
        {
          calc: 'SUM',
          dataElement: 'RHS6UNFPA1298',
        },
      ],
    ],
    columns: {
      type: '$period',
      periodType: 'quarter',
      aggregationType: 'FINAL_EACH_QUARTER',
    },
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },

  viewJson: {
    name: 'RH Products Stock Availability (HFRSA and Spot Check Survey Data)',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
    periodGranularity: 'one_year_at_a_time',
    showPeriodRange: 'all',
    presentationOptions: {
      type: 'condition',
      conditions: [
        {
          key: 'red',
          color: '#b71c1c',
          label: '',
          condition: 0,
          description: 'Out of stock: ',
          legendLabel: 'Out of stock',
        },
        {
          key: 'green',
          color: '#33691e',
          label: '',
          condition: {
            '>': 0,
          },
          description: 'In stock: ',
          legendLabel: 'In stock',
        },
      ],
      showRawValue: true,
    },
  },
};

const nationalAndProvincialLevelDashboardReportConfig = {
  id: 'RH_Products_Stock_Availability_HFRSA_And_Spot_Check_Survey_Data_With_Percentage',
  dataBuilder: 'tableOfCalculatedValues',
  dataBuilderConfig: {
    rows: [
      'Male condoms',
      'Female condoms',
      'Combined oral contraceptive',
      'Progesterone only pill',
      'Injectable contraceptives',
      'IUDs',
      'Implant contraceptives',
      'Emergency contraceptives',
    ],
    cells: [
      [
        {
          dataElement: 'RHS6UNFPA1207',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1220',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1233',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1246',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1259',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1272',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1285',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1298',
          operator: 'GROUP',
          groups: {
            Y: { value: 0, operator: '>' },
            N: { value: 0, operator: '=' },
          },
        },
      ],
    ],

    columnSummary: {
      title: '% of items out of stock at facility',
      operator: 'PERCENTAGE',
      operatorConfig: {
        numerator: {
          condition: {
            value: 'N',
            operator: '=',
          },
        },
      },
      excludeCondition: { value: 'No data', operator: '=' },
    },

    rowSummary: {
      title: '% of facilities with item out of stock',
      operator: 'PERCENTAGE',
      operatorConfig: {
        numerator: {
          condition: {
            value: 'N',
            operator: '=',
          },
        },
      },
      excludeCondition: { value: 'No data', operator: '=' },
    },
    columns: '$orgUnit',
    excludedValue: 'No data',
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },

  viewJson: {
    name: 'Availability of Reproductive Health Commodities (HFRSA and Spot Check Survey Data)',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
    periodGranularity: 'one_year_at_a_time',
    showPeriodRange: 'all',
  },
};

const nationalAndProvincialLevelLineGraphReportConfig = {
  id: 'RH_Products_Stock_Availability_HFRSA_And_Spot_Check_Survey_Data_Line_Graph',
  dataBuilder: 'percentagesOfValueCountsPerPeriod',
  dataBuilderConfig: {
    periodType: 'quarter',
    dataClasses: {
      'Male condoms': {
        numerator: {
          dataValues: ['RHS6UNFPA1207'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1207'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
      'Female condoms': {
        numerator: {
          dataValues: ['RHS6UNFPA1220'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1220'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
      'Combined oral contraceptive': {
        numerator: {
          dataValues: ['RHS6UNFPA1233'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1233'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
      'Progesterone only pill': {
        numerator: {
          dataValues: ['RHS6UNFPA1246'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1246'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
      'Injectable contraceptives': {
        numerator: {
          dataValues: ['RHS6UNFPA1259'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1259'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
      IUDs: {
        numerator: {
          dataValues: ['RHS6UNFPA1272'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1272'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
      'Implant contraceptives': {
        numerator: {
          dataValues: ['RHS6UNFPA1285'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1285'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
      'Emergency contraceptives': {
        numerator: {
          dataValues: ['RHS6UNFPA1298'],
          valueOfInterest: {
            operator: '=',
            value: 0,
          },
        },
        denominator: {
          dataValues: ['RHS6UNFPA1298'],
          valueOfInterest: {
            operator: '>=',
            value: 0,
          },
        },
      },
    },
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  viewJson: {
    name: 'RH Product Availability: % Facilities Out of Stock (HFRSA and Spot Check Survey Data)',
    type: 'chart',
    chartType: 'line',
    labelType: 'fractionAndPercentage',
    valueType: 'percentage',
    chartConfig: {
      'Male condoms': { legendOrder: 1 },
      'Female condoms': { legendOrder: 2 },
      'Combined oral contraceptive': { legendOrder: 3 },
      'Progesterone only pill': { legendOrder: 4 },
      'Injectable contraceptives': { legendOrder: 5 },
      IUDs: { legendOrder: 6 },
      'Implant contraceptives': { legendOrder: 7 },
      'Emergency contraceptives': { legendOrder: 8 },
    },
    showPeriodRange: 'all',
    periodGranularity: 'quarter',
  },
};
exports.up = async function (db) {
  // Facility Level Matrix Table
  await insertObject(db, 'dashboardReport', facilityLevelDashboardReportConfig);
  await addArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    facilityLevelDashboardReportConfig.id,
    `"organisationUnitCode" in (${arrayToDbString(
      countryCodes,
    )}) and "name" = 'UNFPA' and "organisationLevel" = 'Facility'`,
  );

  // National and Provincial Matrix Table and Line Graph Chart
  for (const dashboardReport of [
    nationalAndProvincialLevelDashboardReportConfig,
    nationalAndProvincialLevelLineGraphReportConfig,
  ]) {
    await insertObject(db, 'dashboardReport', dashboardReport);
    await addArrayValue(
      db,
      'dashboardGroup',
      'dashboardReports',
      dashboardReport.id,
      `"organisationUnitCode" in (${arrayToDbString(
        countryCodes,
      )}) and "name" = 'UNFPA' and "organisationLevel" in ('District','Country')`,
    );
  }
};

exports.down = async function (db) {
  await deleteReport(db, facilityLevelDashboardReportConfig.id);
  await removeArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    facilityLevelDashboardReportConfig.id,
    `"organisationUnitCode" in (${arrayToDbString(
      countryCodes,
    )}) and "name" = 'UNFPA' and "organisationLevel" = 'Facility'`,
  );

  // National and Provincial Matrix Table and Line Graph Chart
  for (const dashboardReport of [
    nationalAndProvincialLevelDashboardReportConfig,
    nationalAndProvincialLevelLineGraphReportConfig,
  ]) {
    await deleteReport(db, dashboardReport.id);
    await removeArrayValue(
      db,
      'dashboardGroup',
      'dashboardReports',
      dashboardReport.id,
      `"organisationUnitCode" in (${arrayToDbString(
        countryCodes,
      )}) and "name" = 'UNFPA' and "organisationLevel" in ('District','Country')`,
    );
  }
};

exports._meta = {
  version: 1,
};
