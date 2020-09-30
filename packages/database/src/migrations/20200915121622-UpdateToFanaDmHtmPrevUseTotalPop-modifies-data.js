'use strict';

import { generateId, insertObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};
// "POP14",
// "POP16AND18",
// "POP20AND22",
// "POP24AND26"
// "POP28AND30",
// "POP3234AND36",
const indicators = {
  ANNUAL_TOTAL_POPULATION_MALE: {
    code: 'ANNUAL_TOTAL_POPULATION_MALE',
    builder: 'arithmetic',
    config: {
      formula: 'POP14 + POP16AND18 + POP20AND22 + POP24AND26 + POP28AND30 + POP3234AND36',
      aggregation: {
        POP14: 'FINAL_EACH_YEAR',
        POP16AND18: 'FINAL_EACH_YEAR',
        POP20AND22: 'FINAL_EACH_YEAR',
        POP24AND26: 'FINAL_EACH_YEAR',
        POP28AND30: 'FINAL_EACH_YEAR',
        POP3234AND36: 'FINAL_EACH_YEAR',
      },
      defaultValues: {
        POP14: 0,
        POP16AND18: 0,
        POP20AND22: 0,
        POP24AND26: 0,
        POP28AND30: 0,
        POP3234AND36: 0,
      },
    },
  },
  // "POP15",
  // "POP17AND19"
  // "POP21AND23",
  // "POP25AND27",
  // "POP29AND31",
  // "POP3335AND37",
  ANNUAL_TOTAL_POPULATION_FEMALE: {
    code: 'ANNUAL_TOTAL_POPULATION_FEMALE',
    builder: 'arithmetic',
    config: {
      formula: 'POP15 + POP17AND19 + POP21AND23 + POP25AND27 + POP29AND31 + POP3335AND37',
      aggregation: {
        POP15: 'FINAL_EACH_YEAR',
        POP17AND19: 'FINAL_EACH_YEAR',
        POP21AND23: 'FINAL_EACH_YEAR',
        POP25AND27: 'FINAL_EACH_YEAR',
        POP29AND31: 'FINAL_EACH_YEAR',
        POP3335AND37: 'FINAL_EACH_YEAR',
      },
      defaultValues: {
        POP15: 0,
        POP17AND19: 0,
        POP21AND23: 0,
        POP25AND27: 0,
        POP29AND31: 0,
        POP3335AND37: 0,
      },
    },
  },
};

const reportId = 'TO_CH_DM_HTN_Prevalence';
const orgUnit = 'TO';
const seriesKeyToIndicator = {
  'HTN males': 'ANNUAL_TOTAL_POPULATION_MALE',
  'DM males': 'ANNUAL_TOTAL_POPULATION_MALE',
  'HTN females': 'ANNUAL_TOTAL_POPULATION_FEMALE',
  'DM females': 'ANNUAL_TOTAL_POPULATION_FEMALE',
};

const insertIndicator = async (db, indicator) => {
  const { code } = indicator;

  await insertObject(db, 'data_source', {
    id: generateId(),
    code,
    type: 'dataElement',
    service_type: 'indicator',
  });
  await insertObject(db, 'indicator', { id: generateId(), ...indicator });
};

const deleteIndicator = async (db, indicator) => {
  const { code } = indicator;
  await db.runSql(
    `DELETE FROM data_source WHERE code = '${code}';
    DELETE FROM indicator WHERE code = '${code}';
  `,
  );
};

exports.up = async function(db) {
  await Promise.all(
    Object.values(indicators).map(async indicator => insertIndicator(db, indicator)),
  );

  const report = await db.runSql(
    `select "dataBuilderConfig" from "dashboardReport" where "id" = '${reportId}';`,
  );
  const { dataBuilderConfig: oldConfig } = report.rows[0];
  const newSeries = oldConfig.series.map(metric => ({
    ...metric,
    denominator: {
      dataElementCodes: seriesKeyToIndicator[metric.key],
      organisationUnitCode: orgUnit,
      includeAllResults: true,
    },
  }));

  const newConfig = { ...oldConfig, series: newSeries };

  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(newConfig)}'
    where "id" = '${reportId}';
  `);
};

exports.down = async function(db) {
  await Promise.all(
    Object.values(indicators).map(async indicator => deleteIndicator(db, indicator)),
  );

  const report = await db.runSql(
    `select "dataBuilderConfig" from "dashboardReport" where "id" = '${reportId}';`,
  );
  const { dataBuilderConfig: oldConfig } = report.rows[0];
  const newSeries = oldConfig.series.map(metric => ({
    ...metric,
    denominator: Object.keys(indicators[metric.denominator.dataElementCodes].config.aggregation),
  }));

  const newConfig = { ...oldConfig, series: newSeries };

  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(newConfig)}'
    where "id" = '${reportId}';
  `);
};

exports._meta = {
  version: 1,
};
