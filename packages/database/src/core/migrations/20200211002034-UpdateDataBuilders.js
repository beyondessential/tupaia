'use strict';

import { DATA_BUILDER_CONFIGS } from './migrationData/20200211002034-UpdateDataBuilders';

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

const buildWhereCondition = (id, drillDownLevel) => {
  const drillDownLevelCondition = drillDownLevel
    ? `"drillDownLevel" = ${drillDownLevel}`
    : '"drillDownLevel" IS NULL';
  return `id = '${id}' AND ${drillDownLevelCondition};`;
};

const replaceDataBuilderName = async (db, id, dataBuilderName) =>
  db.runSql(
    `UPDATE "dashboardReport" SET "dataBuilder" = '${dataBuilderName}'
    WHERE ${buildWhereCondition(id)}`,
  );

const replaceDataBuilderConfig = async (db, { id, drillDownLevel, dataBuilderConfig }) =>
  db.runSql(`
  UPDATE "dashboardReport" SET "dataBuilderConfig" = '${JSON.stringify(dataBuilderConfig)}'
  WHERE ${buildWhereCondition(id, drillDownLevel)}`);

const updateViewJson = async (db, id, newViewJson, { drillDownLevel } = {}) =>
  db.runSql(
    `UPDATE "dashboardReport" SET "viewJson" = "viewJson" || '${JSON.stringify(newViewJson)}'
    WHERE ${buildWhereCondition(id, drillDownLevel)}`,
  );

exports.up = async function (db) {
  await Promise.all(
    DATA_BUILDER_CONFIGS.map(({ id, drillDownLevel, new: dataBuilderConfig }) =>
      replaceDataBuilderConfig(db, { id, drillDownLevel, dataBuilderConfig }),
    ),
  );

  await updateViewJson(db, 'TO_RH_D07.1', {
    chartConfig: { 'Home Visits': { color: '#279A63' }, 'Clinic Visits': { color: '#EE9A30' } },
  });
  await replaceDataBuilderName(db, 'TO_RH_D07.1', 'sumPerDataGroupPerMonth');
};

exports.down = async function (db) {
  await Promise.all(
    DATA_BUILDER_CONFIGS.map(({ id, drillDownLevel, old: dataBuilderConfig }) =>
      replaceDataBuilderConfig(db, { id, drillDownLevel, dataBuilderConfig }),
    ),
  );

  await updateViewJson(db, 'TO_RH_D07.1', {
    chartConfig: {
      'DE_GROUP-Monthly_Home_Visit_Counts': { color: '#279A63', label: 'Home Visits' },
      'DE_GROUP-Monthly_Clinic_Visit_Counts': { color: '#EE9A30', label: 'Clinic Visits' },
    },
  });
  await replaceDataBuilderName(db, 'TO_RH_D07.1', 'sumPerDataElementGroupPerMonth');
};

exports._meta = {
  version: 1,
};
