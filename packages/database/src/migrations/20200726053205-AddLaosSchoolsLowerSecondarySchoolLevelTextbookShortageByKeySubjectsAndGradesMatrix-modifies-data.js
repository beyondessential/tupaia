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

const REPORT_ID =
  'Laos_Schools_Textbooks_Shortage_By_Key_Subjects_And_Grades_Lower_Secondary_School';

const DATA_BUILDER_CONFIG = {
  rows: [
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'Lao Language',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'Mathematics',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'Natural Science',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'Political Science',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'ICT',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'English',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'French',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'Mathematics Exercise Book',
    },
  ],
  cells: [
    [
      {
        key: 'Lao_Language_Textbook_Literature_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL004'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Literature_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL023'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Literature_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL042'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Literature_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL061'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL004'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL023'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL042'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL061'],
        },
      },
    ],
    [
      {
        key: 'Mathematics_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL005'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL024'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL043'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL062'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'Mathematics_Textbook_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL005'],
        },
      },
      {
        key: 'Mathematics_Textbook_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL024'],
        },
      },
      {
        key: 'Mathematics_Textbook_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL043'],
        },
      },
      {
        key: 'Mathematics_Textbook_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL062'],
        },
      },
    ],
    [
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL006'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL025'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL044'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL063'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'Natural_Science_Textbook_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL006'],
        },
      },
      {
        key: 'Natural_Science_Textbook_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL025'],
        },
      },
      {
        key: 'Natural_Science_Textbook_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL044'],
        },
      },
      {
        key: 'Natural_Science_Textbook_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL063'],
        },
      },
    ],
    [
      {
        key: 'Political_Science_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL007'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'Political_Science_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL026'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'Political_Science_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL045'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'Political_Science_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL064'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'Political_Science_Textbook_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL007'],
        },
      },
      {
        key: 'Political_Science_Textbook_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL026'],
        },
      },
      {
        key: 'Political_Science_Textbook_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL045'],
        },
      },
      {
        key: 'Political_Science_Textbook_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL064'],
        },
      },
    ],
    [
      {
        key: 'ICT_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL008'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'ICT_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL027'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'ICT_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL046'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'ICT_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL065'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'ICT_Textbook_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL008'],
        },
      },
      {
        key: 'ICT_Textbook_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL027'],
        },
      },
      {
        key: 'ICT_Textbook_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL046'],
        },
      },
      {
        key: 'ICT_Textbook_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL065'],
        },
      },
    ],
    [
      {
        key: 'English_Language_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL009'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'English_Language_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL028'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'English_Language_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL047'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'English_Language_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL066'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'English_Language_Textbook_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL009'],
        },
      },
      {
        key: 'English_Language_Textbook_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL028'],
        },
      },
      {
        key: 'English_Language_Textbook_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL047'],
        },
      },
      {
        key: 'English_Language_Textbook_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL066'],
        },
      },
    ],
    [
      {
        key: 'French_Language_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL010'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'French_Language_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL029'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'French_Language_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL048'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'French_Language_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL067'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'French_Language_Textbook_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL010'],
        },
      },
      {
        key: 'French_Language_Textbook_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL029'],
        },
      },
      {
        key: 'French_Language_Textbook_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL048'],
        },
      },
      {
        key: 'French_Language_Textbook_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL067'],
        },
      },
    ],
    [
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL011'],
        },
        secondOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
      },
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL030'],
        },
        secondOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
      },
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL049'],
        },
        secondOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
      },
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL068'],
        },
        secondOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
      },
    ],
    [
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G6',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop021', 'SchPop022'],
        },
        secondOperand: {
          dataValues: ['STCL011'],
        },
      },
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G7',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop023', 'SchPop024'],
        },
        secondOperand: {
          dataValues: ['STCL030'],
        },
      },
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G8',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop025', 'SchPop026'],
        },
        secondOperand: {
          dataValues: ['STCL049'],
        },
      },
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G9',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop027', 'SchPop028'],
        },
        secondOperand: {
          dataValues: ['STCL068'],
        },
      },
    ],
  ],
  columns: ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Textbooks Shortage by Key Subjects and Grades: Lower Secondary',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  displayOnEntityConditions: {
    attributes: {
      type: 'Secondary',
    },
  },
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'tableOfCalculatedValues',
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
