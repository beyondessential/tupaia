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

const getReportsWithDataSourceEntityFilter = async db => {
  // Get all reports with dataSourceEntityFilter set
  const reports = await db.runSql(
    `SELECT * from report where config->>'transform' LIKE '%dataSourceEntityFilter%';`,
  );
  return reports.rows;
};

const reformatReportConfig = (report, initialDelimiter, newDelimiter) => {
  const { config } = report;

  const newTransforms = config.transform.map(transform => {
    // If the transform doesn't have aggregations, return it as is
    if (!transform.parameters?.aggregations) return transform;

    // If the transform has aggregations, update the dataSourceEntityFilter to use standard jsonb syntax
    const updatedAggregations = transform.parameters.aggregations.map(aggregation => {
      if (aggregation.config?.dataSourceEntityFilter) {
        return {
          ...aggregation,
          config: {
            ...aggregation.config,
            dataSourceEntityFilter: Object.entries(
              aggregation.config.dataSourceEntityFilter,
            ).reduce((result, [key, value]) => {
              const newKey = key.replace(initialDelimiter, newDelimiter);
              return {
                ...result,
                [newKey]: value,
              };
            }, {}),
          },
        };
      }
      return aggregation;
    });

    return {
      ...transform,
      parameters: {
        ...transform.parameters,
        aggregations: updatedAggregations,
      },
    };
  });
  return {
    ...config,
    transform: newTransforms,
  };
};

const updateReport = async (db, report, newConfig) => {
  await db.runSql(
    `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
      "'",
      "''",
    )}'::json WHERE id = '${report.id}'`,
  );
};

exports.up = async function (db) {
  const reportsToChange = await getReportsWithDataSourceEntityFilter(db);
  await Promise.all(
    reportsToChange.map(report => {
      const newConfig = reformatReportConfig(report, '_', '->>');
      return updateReport(db, report, newConfig);
    }),
  );
  return null;
};

exports.down = async function (db) {
  const reportsToChange = await getReportsWithDataSourceEntityFilter(db);
  await Promise.all(
    reportsToChange.map(report => {
      const newConfig = reformatReportConfig(report, '->>', '_');
      return updateReport(db, report, newConfig);
    }),
  );
};

exports._meta = {
  version: 1,
};
