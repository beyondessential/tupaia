'use strict';

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

const reportId = 'TO_CH_DM_HTN_Prevalence';
const orgUnit = 'TO';

exports.up = async function(db) {
  const report = await db.runSql(
    `select "dataBuilderConfig" from "dashboardReport" where "id" = '${reportId}';`,
  );
  const { dataBuilderConfig: oldConfig } = report.rows[0];
  const newSeries = oldConfig.series.map(metric => ({
    ...metric,
    denominator: {
      dataElementCodes: metric.denominator,
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
  const report = await db.runSql(
    `select "dataBuilderConfig" from "dashboardReport" where "id" = '${reportId}';`,
  );
  const { dataBuilderConfig: oldConfig } = report.rows[0];
  const newSeries = oldConfig.series.map(metric => ({
    ...metric,
    denominator: metric.denominator.dataElementCodes,
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
