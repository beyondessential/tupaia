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
  'Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Primary_School';

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
      category: 'World Around Us',
    },
  ],
  cells: [
    [
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G1',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL001'],
          },
          {
            dataValues: ['SchPop011', 'SchPop012'],
          },
        ],
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G2',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL020'],
          },
          {
            dataValues: ['SchPop013', 'SchPop014'],
          },
        ],
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G3',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL039'],
          },
          {
            dataValues: ['SchPop015', 'SchPop016'],
          },
        ],
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G4',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL058'],
          },
          {
            dataValues: ['SchPop017', 'SchPop018'],
          },
        ],
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G5',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL077'],
          },
          {
            dataValues: ['SchPop019', 'SchPop020'],
          },
        ],
      },
    ],
    [
      {
        key: 'Lao_Language_Shortage_Ratio_G1',
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
      {
        key: 'Lao_Language_Shortage_Ratio_G2',
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
      {
        key: 'Lao_Language_Shortage_Ratio_G3',
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
      {
        key: 'Lao_Language_Shortage_Ratio_G4',
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
      {
        key: 'Lao_Language_Shortage_Ratio_G5',
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
    ],
    [
      {
        key: 'Mathematics_Textbook_Student_Ratio_G1',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL002'],
          },
          {
            dataValues: ['SchPop011', 'SchPop012'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G2',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL021'],
          },
          {
            dataValues: ['SchPop013', 'SchPop014'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G3',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL040'],
          },
          {
            dataValues: ['SchPop015', 'SchPop016'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G4',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL059'],
          },
          {
            dataValues: ['SchPop017', 'SchPop018'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G5',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL078'],
          },
          {
            dataValues: ['SchPop019', 'SchPop020'],
          },
        ],
      },
    ],
    [
      {
        key: 'Mathematics_Shortage_Ratio_G1',
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
      {
        key: 'Mathematics_Shortage_Ratio_G2',
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
      {
        key: 'Mathematics_Shortage_Ratio_G3',
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
      {
        key: 'Mathematics_Shortage_Ratio_G4',
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
      {
        key: 'Mathematics_Shortage_Ratio_G5',
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
    ],
    [
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G1',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL003'],
          },
          {
            dataValues: ['SchPop011', 'SchPop012'],
          },
        ],
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G2',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL022'],
          },
          {
            dataValues: ['SchPop013', 'SchPop014'],
          },
        ],
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G3',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL041'],
          },
          {
            dataValues: ['SchPop015', 'SchPop016'],
          },
        ],
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G4',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL060'],
          },
          {
            dataValues: ['SchPop017', 'SchPop018'],
          },
        ],
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G5',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL079'],
          },
          {
            dataValues: ['SchPop019', 'SchPop020'],
          },
        ],
      },
    ],
    [
      {
        key: 'World_Around_Us_Shortage_Ratio_G1',
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
      {
        key: 'World_Around_Us_Shortage_Ratio_G2',
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
      {
        key: 'World_Around_Us_Shortage_Ratio_G3',
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
      {
        key: 'World_Around_Us_Shortage_Ratio_G4',
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
      {
        key: 'World_Around_Us_Shortage_Ratio_G5',
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
    ],
  ],
  columns: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Textbooks Shortage by Key Subjects and Grades: Primary',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  displayOnEntityConditions: {
    attributes: {
      type: 'Primary',
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
