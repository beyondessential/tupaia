'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';
import { generateId } from '../utilities/generateId';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const CODES = ['PF', 'PV', 'PM', 'PO'];

const codeToIndicatorCode = code => `STRIVE_Percentage_${code}_Of_Total_Weekly`;
const codeToIndicator = code => ({
  id: generateId(),
  code: codeToIndicatorCode(code),
  builder: 'analyticArithmetic',
  config: {
    formula: `${codeToDataElementCode(code)} / STR_QMAL05`,
    aggregation: 'SUM_EACH_WEEK',
  },
});
const codeToDataElementCode = code => `STR_${code}05`;
const codeToSeriesName = code => `${code[0]}${code[1].toLowerCase()} +ve`;

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

const REPORT = {
  id: 'PG_Strive_PNG_Positive_Result_By_Type_Bar',
  dataBuilder: 'analyticsPerPeriod',
  dataBuilderConfig: {
    series: CODES.map(code => ({
      key: codeToSeriesName(code),
      dataElementCode: codeToIndicatorCode(code),
    })),
    entityAggregation: {
      dataSourceEntityType: 'case',
      aggregationEntityType: 'facility',
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
    },
  },
  viewJson: {
    name: 'Lab Confirmed Positive Results, Bar Graph',
    type: 'chart',
    chartType: 'bar',
    chartConfig: CODES.reduce(
      (prev, code) => ({
        ...prev,
        [`${codeToSeriesName(code)}`]: { stackId: 1 },
      }),
      {},
    ),
    periodGranularity: 'week',
    valueType: 'percentage',
    presentationOptions: {
      hideAverage: true,
    },
  },
};
const DASHBOARD_GROUP_CODE = 'PG_Strive_PNG_Facility';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(CODES.map(code => insertIndicator(db, codeToIndicator(code))));

  await insertObject(db, 'dashboardReport', REPORT);
  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await Promise.all(CODES.map(code => deleteIndicator(db, codeToIndicator(code))));

  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
