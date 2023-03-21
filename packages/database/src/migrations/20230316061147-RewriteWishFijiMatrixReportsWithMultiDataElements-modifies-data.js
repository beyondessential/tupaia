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
      transform: updatedTransform(
        REPORTS.find(({ code }) => code === report.code).dataElementCodes,
      ),
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
