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

const REPORT_ID = 'Laos_Schools_School_Textbooks_Shortage_Primary_School';

const LAO_LANGUAGE = 'Lao Language';
const MATHEMATICS = 'Mathematics';
const WORLD_AROUND_US = 'World Around Us';

const GRADE_1 = 'Grade 1';
const GRADE_2 = 'Grade 2';
const GRADE_3 = 'Grade 3';
const GRADE_4 = 'Grade 4';
const GRADE_5 = 'Grade 5';

const DATA_BUILDER_CONFIG = {
  dataClasses: {
    [LAO_LANGUAGE]: {
      [GRADE_1]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
        secondOperand: {
          dataValues: ['STCL001'],
        },
      },
      [GRADE_2]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
        secondOperand: {
          dataValues: ['STCL020'],
        },
      },
      [GRADE_3]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
        secondOperand: {
          dataValues: ['STCL039'],
        },
      },
      [GRADE_4]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
        secondOperand: {
          dataValues: ['STCL058'],
        },
      },
      [GRADE_5]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
        secondOperand: {
          dataValues: ['STCL077'],
        },
      },
    },
    [MATHEMATICS]: {
      [GRADE_1]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
        secondOperand: {
          dataValues: ['STCL002'],
        },
      },
      [GRADE_2]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
        secondOperand: {
          dataValues: ['STCL021'],
        },
      },
      [GRADE_3]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
        secondOperand: {
          dataValues: ['STCL040'],
        },
      },
      [GRADE_4]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
        secondOperand: {
          dataValues: ['STCL059'],
        },
      },
      [GRADE_5]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
        secondOperand: {
          dataValues: ['STCL078'],
        },
      },
    },
    [WORLD_AROUND_US]: {
      [GRADE_1]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
        secondOperand: {
          dataValues: ['STCL003'],
        },
      },
      [GRADE_2]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
        secondOperand: {
          dataValues: ['STCL022'],
        },
      },
      [GRADE_3]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
        secondOperand: {
          dataValues: ['STCL041'],
        },
      },
      [GRADE_4]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
        secondOperand: {
          dataValues: ['STCL060'],
        },
      },
      [GRADE_5]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
        secondOperand: {
          dataValues: ['STCL079'],
        },
      },
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const CHART_CONFIG = {
  [LAO_LANGUAGE]: { stackId: 1 },
  [MATHEMATICS]: { stackId: 2 },
  [WORLD_AROUND_US]: { stackId: 3 },
};

const VIEW_JSON = {
  name: 'Textbook Shortage: Primary',
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'month',
  chartConfig: CHART_CONFIG,
  displayOnEntityConditions: {
    attributes: {
      type: 'Primary',
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
