'use strict';

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

const reportId = 'UNFPA_Region_Facilities_offering_services_At_Least_1_Matrix';
const newDataElement = 'RHS2UNFPA240';
const newRowName = 'Adolescent and Youth Services';
const newRowKeySuffix = '_Adolescent_and_Youth_Services';
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
const baseCellConfig = {
  operands: [
    {
      dataValues: [newDataElement],
      aggregationType: 'COUNT',
      aggregationConfig: {
        countCondition: {
          value: 'Yes',
          operator: '=',
        },
      },
    },
    {
      dataValues: ['RHS1UNFPA03'],
      aggregationType: 'COUNT',
    },
  ],
  operator: 'FRACTION_AND_PERCENTAGE',
};
const countryCellConfigs = Object.keys(countryCodeToName).map(code => ({
  key: `${countryCodeToName[code]}${newRowKeySuffix}`,
  filter: {
    organisationUnit: code,
  },
  ...baseCellConfig,
}));
const rowsPath = '{rows}';
const cellsPath = '{cells}';

exports.up = function (db) {
  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${rowsPath}', 
    "dataBuilderConfig"->'rows' || '${JSON.stringify(newRowName)}'::jsonb)
    where id = '${reportId}';

    update "dashboardReport"
    set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${cellsPath}', 
    "dataBuilderConfig"->'cells' || '${JSON.stringify([countryCellConfigs])}')
    where id = '${reportId}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
