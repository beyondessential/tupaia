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

const extraTransforms = [
  {
    transform: 'updateColumns',
    insert: {
      '=$period': '=$value',
    },
    include: ['organisationUnit'],
  },
  {
    transform: 'mergeRows',
    using: 'single',
    groupBy: 'organisationUnit',
  },
  {
    transform: 'fetchData',
    dataTableCode: 'entities',
    parameters: {
      entityCodes: '= @all.organisationUnit',
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
    transform: 'excludeColumns',
    columns: ['code', 'organisationUnit'],
  },
];

const oldTransforms = [
  {
    transform: 'updateColumns',
    insert: {
      name: '=orgUnitCodeToName($organisationUnit)',
      '=$period': '=$value',
    },
    exclude: '*',
  },
  {
    transform: 'mergeRows',
    using: 'single',
    groupBy: 'name',
  },
];

exports.up = async function (db) {
  const { rows: reports } = await db.runSql(`
  SELECT * FROM report WHERE config::text LIKE '%orgUnitCodeToName%' AND code LIKE 'wish%' AND code LIKE '%baseline%'
  `);

  for (const report of reports) {
    const { transform } = report.config;
    const firstTransform = transform.shift();
    const lastTransform = transform.pop();
    const updatedTransform = [firstTransform, ...extraTransforms, lastTransform];

    const newConfig = { ...report.config, transform: updatedTransform };

    await db.runSql(
      `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
        "'",
        "''",
      )}'::json WHERE id = '${report.id}'`,
    );
  }
};

exports.down = async function (db) {
  const { rows: reports } = await db.runSql(`
  SELECT * FROM report WHERE code LIKE 'wish%' AND code LIKE '%baseline%'
  `);

  for (const report of reports) {
    const { transform } = report.config;
    const firstTransform = transform.shift();
    const lastTransform = transform.pop();
    const updatedTransform = [firstTransform, ...oldTransforms, lastTransform];

    const newConfig = { ...report.config, transform: updatedTransform };

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
