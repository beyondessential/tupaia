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
    code: 'wish_krf_fj_matrix_adequacy_supply_primary_water_source',
    dataElementCode: 'WISH_KRF05',
  },
  {
    code: 'wish_krf_fj_matrix_environmental_water_quality',
    dataElementCode: 'WISH_KRF04',
  },
  {
    code: 'wish_krf_fj_matrix_household_perceptions_of_flooding_frequency',
    dataElementCode: 'WISH_KRF01',
  },
  {
    code: 'wish_krf_fj_matrix_livestock_presence_near_water_sources',
    dataElementCode: 'WISH_KRF03',
  },
  {
    code: 'wish_krf_fj_matrix_safely_managed_sanitation',
    dataElementCode: 'WISH_KRF09',
  },
  {
    code: 'wish_krf_fj_matrix_sanitation_infrastructure',
    dataElementCode: 'WISH_KRF10',
  },
  {
    code: 'wish_krf_fj_matrix_swamps_proximal',
    dataElementCode: 'WISH_KRF02',
  },
  {
    code: 'wish_krf_fj_matrix_using_rivers_for_chores_recreation_activities',
    dataElementCode: 'WISH_KRF14',
  },
  {
    code: 'wish_krf_fj_matrix_working_in_wet_environments',
    dataElementCode: 'WISH_KRF13',
  },
];

const riskFactorFoodTransform = [
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
      dataElementCodes: ['WISH_KRF11', 'WISH_KRF12'],
    },
    dataTableCode: 'analytics',
  },
  {
    transform: 'fetchData',
    join: [
      {
        tableColumn: 'dataElement',
        newDataColumn: 'code',
      },
    ],
    parameters: {
      dataElementCodes: '=@all.dataElement',
    },
    dataTableCode: 'data_element_metadata',
  },
  {
    transform: 'updateColumns',
    insert: {
      dataElementName: "=$period == '2019' ? $name + ' Baseline' : $name + ' Endline'",
    },
    exclude: ['dataElement', 'code', 'name'],
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
      "=$dataElementName + ' (' + $period + ')'": '=exists($value) ? $value : -999',
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

const updatedTransform = dataElementCode => [
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
      dataElementCodes: [dataElementCode],
    },
    dataTableCode: 'analytics',
  },
  {
    transform: 'fetchData',
    dataTableCode: 'entities',
    parameters: {
      entityCodes: '=@all.organisationUnit',
      fields: ['code', 'name'],
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
      "=eq($period,'2019')?'Baseline2019':(eq($period,'2022')?'Endline2022':undefined)": '=$value',
    },
    include: 'name',
  },
  {
    transform: 'mergeRows',
    groupBy: 'name',
    using: 'single',
  },
  {
    transform: 'sortRows',
    by: 'name',
  },
  {
    transform: 'updateColumns',
    insert: {
      'Endline (2022)': '=exists($Endline2022)?$Endline2022 : -999',
      'Baseline (2019)': '=exists($Baseline2019)?$Baseline2019 : -999',
    },
    include: 'name',
  },
];

exports.up = async function (db) {
  const { rows: reports } = await db.runSql(`
  SELECT * FROM report WHERE code IN (${arrayToDbString(REPORTS.map(rep => rep.code))})
  `);

  for (const report of reports) {
    const { transform } = report.config;

    const newConfig = {
      ...report.config,
      transform:
        report.code === 'wish_krf_fj_matrix_food'
          ? riskFactorFoodTransform
          : updatedTransform(REPORTS.find(({ code }) => code === report.code).dataElementCode),
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
