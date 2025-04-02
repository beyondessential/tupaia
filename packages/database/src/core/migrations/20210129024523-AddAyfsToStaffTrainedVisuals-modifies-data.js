'use strict';

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

const regionalReportId = 'UNFPA_Region_Facilities_offering_services_At_Least_1_Matrix';
const countryReportIds = [
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_FJ',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_FM',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_KI',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_MH',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_WS',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_SB',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_TO',
  'UNFPA_Country_Facilities_offering_services_At_Least_1_Matrix_VU',
];
const allReportIds = [regionalReportId, ...countryReportIds];
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
          value: '0',
          operator: '>',
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

const buildCellConfig = code => ({
  key: `${countryCodeToName[code]}${newRowKeySuffix}`,
  filter: {
    organisationUnit: code,
  },
  ...baseCellConfig,
});

const regionCellConfigs = Object.keys(countryCodeToName).map(code => buildCellConfig(code));

const rowsInsertPath = '{rows, -1}';
const cellsInsertPath = '{cells, -1}';

const updateConfig = (db, path, value, ids) =>
  db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = jsonb_insert("dataBuilderConfig", '${path}', 
    '${JSON.stringify(value)}'::jsonb)
    where id IN (${arrayToDbString(ids)});
  `);

exports.up = async function (db) {
  // all row names are the same
  await updateConfig(db, rowsInsertPath, newRowName, allReportIds);

  // regional config
  await updateConfig(db, cellsInsertPath, regionCellConfigs, [regionalReportId]);

  await Promise.all(
    countryReportIds.map(countryReportId =>
      updateConfig(
        db,
        cellsInsertPath,
        [
          buildCellConfig(
            countryReportId.substring(countryReportId.length - 2, countryReportId.length),
          ),
        ],
        [countryReportId],
      ),
    ),
  );
};

exports.down = function (db) {
  return null;
  // return db.runSql(`
  //   update "dashboardReport"
  //   set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{rows}', "dataBuilderConfig"#>'{rows}' - 3)
  //   where id IN (${arrayToDbString(allReportIds)});

  //   update "dashboardReport"
  //   set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '{cells}', "dataBuilderConfig"#>'{cells}' - 3)
  //   where id IN (${arrayToDbString(allReportIds)});
  // `);
};

exports._meta = {
  version: 1,
};
