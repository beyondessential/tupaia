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

exports.up = async function (db) {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE config::text LIKE '%dataElementCodeToName($dataElement)%'`,
  );
  for (const report of reports) {
    const { transform } = report.config;
    const { dataElementCodes } = transform[0].parameters;

    const fetchMetaData = {
      transform: 'fetchData',
      dataTableCode: 'data_element_metadata',
      parameters: { dataElementCodes },
      join: [
        {
          tableColumn: 'dataElement',
          newDataColumn: 'code',
        },
      ],
    };
    const excludeUnusedMetadata = {
      transform: 'excludeColumns',
      columns: ['id', 'code'],
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

    let newTransform = transform
      .map(t => {
        if (JSON.stringify(t).includes('dataElementCodeToName(')) {
          return [
            fetchMetaData,
            excludeUnusedMetadata,
            renameDataElementName,
            t,
            removeDataElementMetadata,
          ];
        }
        return [t];
      })
      .flat();

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
