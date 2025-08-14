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

const removeDataElementCodeToName = transform => {
  const transformString = JSON.stringify(transform);
  return JSON.parse(
    transformString.replaceAll('dataElementCodeToName($dataElement)', '$dataElementName'),
  );
};

const restoreDataElementCodeToName = transform => {
  const transformString = JSON.stringify(transform);
  return JSON.parse(
    transformString.replaceAll('$dataElementName', 'dataElementCodeToName($dataElement)'),
  );
};

const PALAU_MATRIX_REPORT_CODE = 'nu_pw_matrix_opr_daily_ward_report';
const fetchForPalauMatrix = {
  transform: 'fetchData',
  join: [
    {
      tableColumn: 'dataElement',
      newDataColumn: 'code',
    },
  ],
  parameters: {
    dataElementCodes: [
      'PW_OPD01_004',
      'PW_OPD01_005',
      'PW_OPD01_006',
      'PW_OPD01_007',
      'PW_OPD01_009',
      'PW_OPD01_010',
      'PW_OPD01_011',
      'PW_OPD01_012',
      'PW_OPD01_014',
      'PW_OPD01_015',
      'PW_OPD01_016',
      'PW_OPD01_017',
      'PW_OPD01_018',
      'PW_OPD01_019',
      'PW_OPD01_020',
      'PW_OPD01_021',
      'PW_OPD01_022',
      'PW_OPD01_023',
      'PW_OPD01_024',
    ],
  },
  dataTableCode: 'data_element_metadata',
};

exports.up = async function (db) {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE config::text LIKE '%dataElementCodeToName($dataElement)%'`,
  );
  for (const report of reports) {
    const { transform } = report.config;

    const fetchMetaData = {
      transform: 'fetchData',
      dataTableCode: 'data_element_metadata',
      parameters: { dataElementCodes: '=@all.dataElement' },
      join: [
        {
          tableColumn: 'dataElement',
          newDataColumn: 'code',
        },
      ],
    };
    const excludeUnusedMetadata = {
      transform: 'excludeColumns',
      columns: ['id', 'code', 'options'],
    };
    const renameDataElementName = {
      transform: 'updateColumns',
      insert: {
        dataElementName: '=$name',
      },
      exclude: ['name'],
    };
    const removeDataElementMetadata = {
      transform: 'excludeColumns',
      columns: ['dataElementName'],
    };
    const sortRowsByPeriod = {
      transform: 'sortRows',
      by: 'period',
    };
    const orderColumnsByDate = {
      transform: 'orderColumns',
      sortBy: 'date',
    };

    let newTransform = transform
      .flatMap(t => {
        if (JSON.stringify(t).includes('dataElementCodeToName(')) {
          if (report.code === PALAU_MATRIX_REPORT_CODE) {
            return [
              fetchForPalauMatrix,
              excludeUnusedMetadata,
              renameDataElementName,
              t,
              removeDataElementMetadata,
              sortRowsByPeriod,
            ];
          }
          return [
            fetchMetaData,
            excludeUnusedMetadata,
            renameDataElementName,
            t,
            removeDataElementMetadata,
          ];
        }
        return [t];
      });

    if (report.code === PALAU_MATRIX_REPORT_CODE) {
      newTransform = newTransform.concat([orderColumnsByDate]);
    }

    newTransform = removeDataElementCodeToName(newTransform);

    const newConfig = { ...report.config, transform: newTransform };

    await db.runSql(
      `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
        "'",
        "''",
      )}'::json WHERE id = '${report.id}'`,
    );
  }
};

exports.down = async function (db) {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE config::text LIKE '%$dataElementName%';`,
  );
  for (const report of reports) {
    const { transform } = report.config;

    let newTransform = [...transform];
    transform.forEach((t, index) => {
      if (JSON.stringify(t).includes('$dataElementName')) {
        newTransform[index - 3].isToRemove = true;
        newTransform[index - 2].isToRemove = true;
        newTransform[index - 1].isToRemove = true;
        newTransform[index + 1].isToRemove = true;
      }
    });

    newTransform = newTransform.filter(t => !t.isToRemove);
    newTransform = restoreDataElementCodeToName(newTransform);

    if (report.code === PALAU_MATRIX_REPORT_CODE) {
      newTransform = newTransform.slice(0, -1); // Remove column sort
    }

    const newConfig = { ...report.config, transform: newTransform };

    await db.runSql(
      `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
        "'",
        "''",
      )}'::json WHERE id = '${report.id}'`,
    );
  }
};

exports._meta = {
  version: 1,
};
