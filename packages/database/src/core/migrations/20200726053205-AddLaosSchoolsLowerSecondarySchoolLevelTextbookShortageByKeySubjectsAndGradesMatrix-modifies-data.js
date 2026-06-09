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
        operands: [
          {
            dataValues: ['STCL004'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'Lao_Language_Textbook_Literature_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL023'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'Lao_Language_Textbook_Literature_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL042'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'Lao_Language_Textbook_Literature_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL061'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G6',
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
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G7',
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
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G8',
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
      {
        key: 'Lao_Language_Textbook_Literature_Shortage_G9',
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
    ],
    [
      {
        key: 'Mathematics_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL005'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL024'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL043'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL062'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'Mathematics_Textbook_Shortage_G6',
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
      {
        key: 'Mathematics_Textbook_Shortage_G7',
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
      {
        key: 'Mathematics_Textbook_Shortage_G8',
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
      {
        key: 'Mathematics_Textbook_Shortage_G9',
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
    ],
    [
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL006'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL025'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL044'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'Natural_Science_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL063'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'Natural_Science_Textbook_Shortage_G6',
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
      {
        key: 'Natural_Science_Textbook_Shortage_G7',
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
      {
        key: 'Natural_Science_Textbook_Shortage_G8',
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
      {
        key: 'Natural_Science_Textbook_Shortage_G9',
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
    ],
    [
      {
        key: 'Political_Science_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL007'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'Political_Science_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL026'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'Political_Science_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL045'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'Political_Science_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL064'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'Political_Science_Textbook_Shortage_G6',
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
      {
        key: 'Political_Science_Textbook_Shortage_G7',
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
      {
        key: 'Political_Science_Textbook_Shortage_G8',
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
      {
        key: 'Political_Science_Textbook_Shortage_G9',
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
    ],
    [
      {
        key: 'ICT_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL008'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'ICT_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL027'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'ICT_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL046'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'ICT_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL065'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'ICT_Textbook_Shortage_G6',
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
      {
        key: 'ICT_Textbook_Shortage_G7',
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
      {
        key: 'ICT_Textbook_Shortage_G8',
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
      {
        key: 'ICT_Textbook_Shortage_G9',
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
    ],
    [
      {
        key: 'English_Language_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL009'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'English_Language_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL028'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'English_Language_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL047'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'English_Language_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL066'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'English_Language_Textbook_Shortage_G6',
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
      {
        key: 'English_Language_Textbook_Shortage_G7',
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
      {
        key: 'English_Language_Textbook_Shortage_G8',
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
      {
        key: 'English_Language_Textbook_Shortage_G9',
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
    ],
    [
      {
        key: 'French_Language_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL010'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'French_Language_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL029'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'French_Language_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL048'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'French_Language_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL067'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'French_Language_Textbook_Shortage_G6',
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
      {
        key: 'French_Language_Textbook_Shortage_G7',
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
      {
        key: 'French_Language_Textbook_Shortage_G8',
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
      {
        key: 'French_Language_Textbook_Shortage_G9',
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
    ],
    [
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G6',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL011'],
          },
          {
            dataValues: ['SchPop021', 'SchPop022'],
          },
        ],
      },
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G7',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL030'],
          },
          {
            dataValues: ['SchPop023', 'SchPop024'],
          },
        ],
      },
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G8',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL049'],
          },
          {
            dataValues: ['SchPop025', 'SchPop026'],
          },
        ],
      },
      {
        key: 'Mathematics_Exercise_Textbook_Student_Ratio_G9',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL068'],
          },
          {
            dataValues: ['SchPop027', 'SchPop028'],
          },
        ],
      },
    ],
    [
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G6',
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
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G7',
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
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G8',
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
      {
        key: 'Mathematics_Exercise_Textbook_Shortage_G9',
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
