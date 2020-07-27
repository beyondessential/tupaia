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
  dataClasses: {
    [LAO_LANGUAGE]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL004'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL023'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL042'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL061'],
        },
      },
    },
    [MATHEMATICS]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL005'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL024'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL043'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL062'],
        },
      },
    },
    [NATURAL_SCIENCE]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL006'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL025'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL044'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL063'],
        },
      },
    },
    [POLITICAL_SCIENCE]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL007'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL026'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL045'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL064'],
        },
      },
    },
    [ICT]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL008'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL027'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL046'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL065'],
        },
      },
    },
    [ENGLISH]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL009'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL028'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL047'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL066'],
        },
      },
    },
    [FRENCH]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL010'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL029'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL048'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL067'],
        },
      },
    },
    [MATHEMATICS_EXERCISE_BOOK]: {
      [GRADE_6]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL011'],
        },
      },
      [GRADE_7]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL030'],
        },
      },
      [GRADE_8]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL049'],
        },
      },
      [GRADE_9]: {
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL068'],
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
  [NATURAL_SCIENCE]: { stackId: 3 },
  [POLITICAL_SCIENCE]: { stackId: 4 },
  [ICT]: { stackId: 5 },
  [ENGLISH]: { stackId: 6 },
  [FRENCH]: { stackId: 7 },
  [MATHEMATICS_EXERCISE_BOOK]: { stackId: 8 },
};

const VIEW_JSON = {
  name: 'Textbook Shortage: Lower Secondary',
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
