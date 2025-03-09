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

const REPORT_ID = 'UNFPA_Delivery_Services_Stock';

exports.up = async function (db) {
  const report = await db.runSql(
    `select "dataBuilderConfig" from "dashboardReport" where "id" = '${REPORT_ID}';`,
  );
  const { dataBuilderConfig: oldConfig } = report.rows[0];
  const dataClasses = {};

  Object.entries(oldConfig.dataClasses).forEach(([name, dataClass]) => {
    const dataElement = dataClass.numerator.dataValues[0];
    dataClasses[name] = {
      numerator: {
        groupBy: 'organisationUnit',
        dataValues: {
          RHS3UNFPA536: {
            value: 1,
            operator: '=',
          },
          [dataElement]: {
            value: 0,
            operator: '>',
          },
        },
        groupBeforeCounting: true,
      },
      denominator: {
        dataValues: ['RHS3UNFPA536'],
        valueOfInterest: 1,
      },
    };
  });

  const newConfig = {
    ...oldConfig,
    dataClasses,
  };

  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(newConfig)}'
    where "id" = '${REPORT_ID}';
  `);
};

exports.down = async function (db) {
  const report = await db.runSql(
    `select "dataBuilderConfig" from "dashboardReport" where "id" = '${REPORT_ID}';`,
  );
  const { dataBuilderConfig: oldConfig } = report.rows[0];
  const dataClasses = {};

  Object.entries(oldConfig.dataClasses).forEach(([name, dataClass]) => {
    const dataElement = Object.keys(dataClass.numerator.dataValues).find(
      de => de !== 'RHS3UNFPA536',
    );

    dataClasses[name] = {
      numerator: {
        groupBy: 'organisationUnit',
        operand: 0,
        operation: 'GT',
        dataValues: [dataElement],
      },
      denominator: {
        dataValues: ['RHS3UNFPA536'],
        valueOfInterest: 1,
      },
    };
  });

  const newConfig = {
    ...oldConfig,
    dataClasses,
  };

  return db.runSql(`
    update "dashboardReport"
    set "dataBuilderConfig" = '${JSON.stringify(newConfig)}'
    where "id" = '${REPORT_ID}';
  `);
};

exports._meta = {
  version: 1,
};
