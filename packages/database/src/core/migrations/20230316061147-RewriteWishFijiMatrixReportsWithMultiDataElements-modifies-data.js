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

const REPORTS = [
  {
    code: 'wish_krf_fj_matrix_food',
    dataElementCodes: ['WISH_KRF11', 'WISH_KRF12'],
  },
  {
    code: 'wish_krf_fj_matrix_drinking_water',
    dataElementCodes: ['WISH_KRF06', 'WISH_KRF07', 'WISH_KRF08'],
  },
  {
    code: 'wish_krf_fj_matrix_water_traps',
    dataElementCodes: ['WISH_KRF15', 'WISH_KRF16', 'WISH_KRF17', 'WISH_KRF18'],
  },
  {
    code: 'wish_krf_fj_matrix_key_risk_factors',
    dataElementCodes: [
      'WISH_KRF01',
      'WISH_KRF02',
      'WISH_KRF03',
      'WISH_KRF04',
      'WISH_KRF05',
      'WISH_KRF06',
      'WISH_KRF07',
      'WISH_KRF08',
      'WISH_KRF09',
      'WISH_KRF10',
      'WISH_KRF11',
      'WISH_KRF12',
      'WISH_KRF13',
      'WISH_KRF14',
      'WISH_KRF15',
      'WISH_KRF16',
      'WISH_KRF17',
      'WISH_KRF18',
    ],
  },
];

const drinkingWaterQualityTransform = [
  {
    transform: 'fetchData',
    parameters: {
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'village',
          },
          description: 'Get the latest response for each year within selected period',
        },
      ],
      dataElementCodes: ['WISH_KRF06', 'WISH_KRF07', 'WISH_KRF08'],
    },
    dataTableCode: 'analytics',
  },
  {
    transform: 'fetchData',
    join: [
      {
        tableColumn: 'organisationUnit',
        newDataColumn: 'code',
      },
    ],
    parameters: {
      fields: ['name', 'code'],
      entityCodes: '=@all.organisationUnit',
    },
    dataTableCode: 'entities',
  },
  {
    transform: 'updateColumns',
    insert: {
      name: '=$name',
      "=$dataElement + '_' + $period": '=exists($value) ? $value : -999',
    },
    exclude: '*',
  },
  {
    transform: 'mergeRows',
    using: 'single',
    groupBy: 'name',
  },
  {
    transform: 'sortRows',
    by: 'name',
  },
  {
    transform: 'updateColumns',
    insert: {
      'Water Piped Endline (2022)': "=exists($WISH_KRF07_2022)?$WISH_KRF07_2022 : '-999'",
      'Water Piped Baseline (2019)': '=exists($WISH_KRF07_2019)?$WISH_KRF07_2019 : -999',
      'Water Source Endline (2022)': "=exists($WISH_KRF06_2022)?$WISH_KRF06_2022 : '-999'",
      'Water Stored Endline (2022)': "=exists($WISH_KRF08_2022)?$WISH_KRF08_2022 : '-999'",
      'Water Source Baseline (2019)': '=exists($WISH_KRF06_2019)?$WISH_KRF06_2019 : -999',
      'Water Stored Baseline (2019)': '=exists($WISH_KRF08_2019)?$WISH_KRF08_2019 : -999',
    },
    include: 'name',
  },
];

const riskFactorWaterTrapsTransform = [
  {
    transform: 'fetchData',
    parameters: {
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'village',
          },
          description: 'Get the latest response for each year within selected period',
        },
      ],
      dataElementCodes: ['WISH_KRF15', 'WISH_KRF16', 'WISH_KRF17', 'WISH_KRF18'],
    },
    dataTableCode: 'analytics',
  },
  {
    transform: 'fetchData',
    join: [
      {
        tableColumn: 'organisationUnit',
        newDataColumn: 'code',
      },
    ],
    parameters: {
      fields: ['name', 'code'],
      entityCodes: '=@all.organisationUnit',
    },
    dataTableCode: 'entities',
  },
  {
    transform: 'updateColumns',
    insert: {
      name: '=$name',
      dataElement: "=$dataElement+'_'+$period",
    },
    include: 'value',
  },
  'keyValueByDataElementName',
  {
    transform: 'mergeRows',
    using: 'single',
    groupBy: 'name',
  },
  {
    transform: 'sortRows',
    by: 'name',
  },
  {
    transform: 'updateColumns',
    insert: {
      'Bushes (not cut down around house) Endline (2022)':
        "=exists($WISH_KRF16_2022)?$WISH_KRF16_2022 : '-999'",
      ' Bushes (not cut down around house) Baseline (2019)':
        '=exists($WISH_KRF16_2019)?$WISH_KRF16_2019 : -999',
      'Containers (uncovered in the house) Endline (2022)':
        "=exists($WISH_KRF17_2022)?$WISH_KRF17_2022 : '-999'",
      'Containers (uncovered in the house) Baseline (2019)':
        '=exists($WISH_KRF17_2019)?$WISH_KRF17_2019 : -999',
      'Ditches (uncleaned outside the home) Endline (2022)':
        "=exists($WISH_KRF18_2022)?$WISH_KRF18_2022 : '-999'",
      'Ditches (uncleaned outside the home) Baseline (2019)':
        '=exists($WISH_KRF18_2019)?$WISH_KRF18_2019 : -999',
      'Pools (standing water around the house) Endline (2022)':
        "=exists($WISH_KRF15_2022)?$WISH_KRF15_2022 : '-999'",
      'Pools (standing water around the house) Baseline (2019)':
        '=exists($WISH_KRF15_2019)?$WISH_KRF15_2019 : -999',
    },
    include: 'name',
  },
];

const updatedTransform = dataElementCodes => [
  {
    transform: 'fetchData',
    parameters: {
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'village',
          },
          description: 'Get the latest response for each year within selected period',
        },
      ],
      dataElementCodes,
    },
    dataTableCode: 'analytics',
  },
  {
    transform: 'fetchData',
    dataTableCode: 'data_element_metadata',
    parameters: {
      dataElementCodes: '=@all.dataElement',
    },
    join: [
      {
        tableColumn: 'dataElement',
        newDataColumn: 'code',
      },
    ],
  },
  {
    transform: 'updateColumns',
    insert: {
      dataElementName: '=$name',
    },
    exclude: ['dataElement', 'code', 'name'],
  },
  {
    transform: 'fetchData',
    dataTableCode: 'entities',
    parameters: {
      entityCodes: '=@all.organisationUnit',
      fields: ['name', 'code'],
    },
    join: [
      {
        tableColumn: 'organisationUnit',
        newDataColumn: 'code',
      },
    ],
  },
  {
    transform: 'updateColumns',
    insert: {
      "=$dataElementName + ' (' + $period + ')'": '=exists($value) ? $value : -999',
      name: '=$name',
    },
    exclude: '*',
  },
  {
    transform: 'mergeRows',
    using: 'single',
    groupBy: 'name',
  },
  {
    transform: 'sortRows',
    by: 'name',
  },
];

const matrixCodes = [
  { code: 'wish_krf_fj_matrix_drinking_water', transform: drinkingWaterQualityTransform },
  { code: 'wish_krf_fj_matrix_water_traps', transform: riskFactorWaterTrapsTransform },
];

const convertOutputToAllColumns = output => {
  const columns = ['*'];
  return { ...output, columns };
};

exports.up = async function (db) {
  const { rows: reports } = await db.runSql(`
  SELECT * FROM report WHERE code IN (${arrayToDbString(REPORTS.map(rep => rep.code))})
  `);

  for (const report of reports) {
    const { output } = report.config;

    const outputWithAllColumns = convertOutputToAllColumns(output);

    const newConfig = {
      ...report.config,
      output: outputWithAllColumns,
      transform: matrixCodes.map(({ code }) => code).includes(report.code)
        ? matrixCodes.find(({ code }) => code === report.code).transform
        : updatedTransform(REPORTS.find(({ code }) => code === report.code).dataElementCodes),
    };

    await db.runSql(
      `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
        "'",
        "''",
      )}'::json WHERE id = '${report.id}'`,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
