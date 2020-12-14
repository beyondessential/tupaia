'use strict';

import { insertObject, removeArrayValue } from '../utilities';
import { addArrayValue, deleteReport } from '../utilities/migration';
import { arrayToDbString } from '../../dist/utilities/migration';

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

const countryCodes = ['FJ', 'FM', 'MH', 'WS'];

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
    presentationOptions: {
      red: {
        color: '#b71c1c',
        label: '',
        condition: 0,
        description: 'Out of stock: ',
      },
      green: {
        color: '#33691e',
        label: '',
        condition: {
          '>': 0,
        },
        description: 'In stock: ',
      },
      type: 'condition',
      showRawValue: true,
    },
  },
};

const nationalAndProvincialLevelDashboardReportConfig = {
  id: 'RH_Products_Stock_Availability_HFRSA_And_Spot_Check_Survey_Data_With_Percentage',
  dataBuilder: 'tableOfCalculatedValuesForOrgUnits',
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
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1220',
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1233',
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1246',
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1259',
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1272',
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1285',
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
          },
        },
      ],
      [
        {
          dataElement: 'RHS6UNFPA1298',
          operator: 'CHECK_CONDITION',
          condition: {
            value: 0,
            operator: '>',
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
            value: 'No',
            operator: '=',
          },
        },
        denominator: {
          condition: {
            operator: '*',
          },
        },
      },
      excludeCondition: { value: 'No data', operator: '=' },
    },
    rowSummary: {
      title: '% of items out of stock at facility',
      condition: {
        value: 'No',
        operator: '=',
      },
      excludeCondition: { value: 'No data', operator: '=' },
    },
    columns: '$orgUnit',
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },

  viewJson: {
    name: 'RH Products Stock Availability (HFRSA and Spot Check Survey Data) With Percentage',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
    periodGranularity: 'one_year_at_a_time',
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

  // National and Provincial Matrix Table
  await insertObject(db, 'dashboardReport', nationalAndProvincialLevelDashboardReportConfig);
  await addArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    nationalAndProvincialLevelDashboardReportConfig.id,
    `"organisationUnitCode" in (${arrayToDbString(
      countryCodes,
    )}) and "name" = 'UNFPA' and "organisationLevel" in ('District','Country')`,
  );
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

  await deleteReport(db, nationalAndProvincialLevelDashboardReportConfig.id);
  await removeArrayValue(
    db,
    'dashboardGroup',
    'dashboardReports',
    nationalAndProvincialLevelDashboardReportConfig.id,
    `"organisationUnitCode" in (${arrayToDbString(
      countryCodes,
    )}) and "name" = 'UNFPA' and "organisationLevel" in ('District','Country')`,
  );
};

exports._meta = {
  version: 1,
};
