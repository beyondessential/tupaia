'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_School_Laos_Schools_User';

const REPORT_ID = 'Laos_Schools_School_Textbooks_Shortage_Upper_Secondary_School';

const LAO_LANGUAGE_AND_LITERATURE = 'Lao Language & Literature';
const MATHEMATICS = 'Mathematics';

const DATA_BUILDER_CONFIG = {
  dataClasses: {
    [LAO_LANGUAGE_AND_LITERATURE]: {
      G10: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop029', 'SchPop030'],
        },
        secondOperand: {
          dataValues: ['STCL080'],
        },
      },
      G11: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop031', 'SchPop032'],
        },
        secondOperand: {
          dataValues: ['STCL096'],
        },
      },
      G12: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop033', 'SchPop034'],
        },
        secondOperand: {
          dataValues: ['STCL112'],
        },
      },
    },
    [MATHEMATICS]: {
      G10: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop029', 'SchPop030'],
        },
        secondOperand: {
          dataValues: ['STCL081'],
        },
      },
      G11: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop031', 'SchPop032'],
        },
        secondOperand: {
          dataValues: ['STCL097'],
        },
      },
      G12: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop033', 'SchPop034'],
        },
        secondOperand: {
          dataValues: ['STCL113'],
        },
      },
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const CHART_CONFIG = {
  [LAO_LANGUAGE_AND_LITERATURE]: { stackId: 1 },
  [MATHEMATICS]: { stackId: 2 },
};

const VIEW_JSON = {
  name: 'Textbook Shortage: Upper Secondary',
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'month',
  chartConfig: CHART_CONFIG,
  displayOnEntityConditions: {
    attributes: {
      type: 'Secondary',
    },
  },
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'calcPerSeries',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = function(db) {
  return db.runSql(`
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
