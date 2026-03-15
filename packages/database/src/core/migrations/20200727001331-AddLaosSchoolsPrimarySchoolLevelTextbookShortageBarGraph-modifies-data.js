'use strict';

import { insertObject } from '../utilities/migration';

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
  series: {
    [LAO_LANGUAGE]: {
      [GRADE_1]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop011', 'SchPop012'],
          },
          {
            dataValues: ['STCL001'],
          },
        ],
      },
      [GRADE_2]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop013', 'SchPop014'],
          },
          {
            dataValues: ['STCL020'],
          },
        ],
      },
      [GRADE_3]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop015', 'SchPop016'],
          },
          {
            dataValues: ['STCL039'],
          },
        ],
      },
      [GRADE_4]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop017', 'SchPop018'],
          },
          {
            dataValues: ['STCL058'],
          },
        ],
      },
      [GRADE_5]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop019', 'SchPop020'],
          },
          {
            dataValues: ['STCL077'],
          },
        ],
      },
    },
    [MATHEMATICS]: {
      [GRADE_1]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop011', 'SchPop012'],
          },
          {
            dataValues: ['STCL002'],
          },
        ],
      },
      [GRADE_2]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop013', 'SchPop014'],
          },
          {
            dataValues: ['STCL021'],
          },
        ],
      },
      [GRADE_3]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop015', 'SchPop016'],
          },
          {
            dataValues: ['STCL040'],
          },
        ],
      },
      [GRADE_4]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop017', 'SchPop018'],
          },
          {
            dataValues: ['STCL059'],
          },
        ],
      },
      [GRADE_5]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop019', 'SchPop020'],
          },
          {
            dataValues: ['STCL078'],
          },
        ],
      },
    },
    [WORLD_AROUND_US]: {
      [GRADE_1]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop011', 'SchPop012'],
          },
          {
            dataValues: ['STCL003'],
          },
        ],
      },
      [GRADE_2]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop013', 'SchPop014'],
          },
          {
            dataValues: ['STCL022'],
          },
        ],
      },
      [GRADE_3]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop015', 'SchPop016'],
          },
          {
            dataValues: ['STCL041'],
          },
        ],
      },
      [GRADE_4]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop017', 'SchPop018'],
          },
          {
            dataValues: ['STCL060'],
          },
        ],
      },
      [GRADE_5]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop019', 'SchPop020'],
          },
          {
            dataValues: ['STCL079'],
          },
        ],
      },
    },
  },
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const CHART_CONFIG = {
  [LAO_LANGUAGE]: { legendOrder: 1 },
  [MATHEMATICS]: { legendOrder: 2 },
  [WORLD_AROUND_US]: { legendOrder: 3 },
};

const VIEW_JSON = {
  name: 'Textbook Shortage: Primary',
  type: 'chart',
  chartType: 'bar',
  valueType: 'number',
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

exports.up = async function (db) {
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

exports.down = function (db) {
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
