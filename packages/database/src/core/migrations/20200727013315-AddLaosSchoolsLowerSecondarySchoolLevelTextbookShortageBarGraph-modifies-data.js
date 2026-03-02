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

const REPORT_ID = 'Laos_Schools_School_Textbooks_Shortage_Lower_Secondary_School';

const LAO_LANGUAGE = 'Lao Language';
const MATHEMATICS = 'Mathematics';
const NATURAL_SCIENCE = 'Natural Science';
const POLITICAL_SCIENCE = 'Political Science';
const ICT = 'ICT';
const ENGLISH = 'English';
const FRENCH = 'French';
const MATHEMATICS_EXERCISE_BOOK = 'Mathematics Exercise Book';

const GRADE_6 = 'Grade 6';
const GRADE_7 = 'Grade 7';
const GRADE_8 = 'Grade 8';
const GRADE_9 = 'Grade 9';

const DATA_BUILDER_CONFIG = {
  series: {
    [LAO_LANGUAGE]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL004'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL023'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL042'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL061'],
          },
        ],
      },
    },
    [MATHEMATICS]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL005'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL024'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL043'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL062'],
          },
        ],
      },
    },
    [NATURAL_SCIENCE]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL006'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL025'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL044'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL063'],
          },
        ],
      },
    },
    [POLITICAL_SCIENCE]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL007'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL026'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL045'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL064'],
          },
        ],
      },
    },
    [ICT]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL008'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL027'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL046'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL065'],
          },
        ],
      },
    },
    [ENGLISH]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL009'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL028'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL047'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL066'],
          },
        ],
      },
    },
    [FRENCH]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL010'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL029'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL048'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL067'],
          },
        ],
      },
    },
    [MATHEMATICS_EXERCISE_BOOK]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
          {
            dataValues: ['STCL011'],
          },
        ],
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
          {
            dataValues: ['STCL030'],
          },
        ],
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
          {
            dataValues: ['STCL049'],
          },
        ],
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
          {
            dataValues: ['STCL068'],
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
  [NATURAL_SCIENCE]: { legendOrder: 3 },
  [POLITICAL_SCIENCE]: { legendOrder: 4 },
  [ICT]: { legendOrder: 5 },
  [ENGLISH]: { legendOrder: 6 },
  [FRENCH]: { legendOrder: 7 },
  [MATHEMATICS_EXERCISE_BOOK]: { legendOrder: 8 },
};

const VIEW_JSON = {
  name: 'Textbook Shortage: Lower Secondary',
  type: 'chart',
  chartType: 'bar',
  valueType: 'number',
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
