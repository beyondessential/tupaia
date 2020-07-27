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
        firstOperand: {
          dataValues: ['STCL001'],
        },
        secondOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G2',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL020'],
        },
        secondOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G3',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL039'],
        },
        secondOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G4',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL058'],
        },
        secondOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
      },
      {
        key: 'Lao_Language_Textbook_Student_Ratio_G5',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL077'],
        },
        secondOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
      },
    ],
    [
      {
        key: 'Lao_Language_Shortage_Ratio_G1',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
        secondOperand: {
          dataValues: ['STCL001'],
        },
      },
      {
        key: 'Lao_Language_Shortage_Ratio_G2',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
        secondOperand: {
          dataValues: ['STCL020'],
        },
      },
      {
        key: 'Lao_Language_Shortage_Ratio_G3',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
        secondOperand: {
          dataValues: ['STCL039'],
        },
      },
      {
        key: 'Lao_Language_Shortage_Ratio_G4',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
        secondOperand: {
          dataValues: ['STCL058'],
        },
      },
      {
        key: 'Lao_Language_Shortage_Ratio_G5',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
        secondOperand: {
          dataValues: ['STCL077'],
        },
      },
    ],
    [
      {
        key: 'Mathematics_Textbook_Student_Ratio_G1',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL002'],
        },
        secondOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G2',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL021'],
        },
        secondOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G3',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL040'],
        },
        secondOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G4',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL059'],
        },
        secondOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G5',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL078'],
        },
        secondOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
      },
    ],
    [
      {
        key: 'Mathematics_Shortage_Ratio_G1',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
        secondOperand: {
          dataValues: ['STCL002'],
        },
      },
      {
        key: 'Mathematics_Shortage_Ratio_G2',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
        secondOperand: {
          dataValues: ['STCL021'],
        },
      },
      {
        key: 'Mathematics_Shortage_Ratio_G3',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
        secondOperand: {
          dataValues: ['STCL040'],
        },
      },
      {
        key: 'Mathematics_Shortage_Ratio_G4',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
        secondOperand: {
          dataValues: ['STCL059'],
        },
      },
      {
        key: 'Mathematics_Shortage_Ratio_G5',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
        secondOperand: {
          dataValues: ['STCL078'],
        },
      },
    ],
    [
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G1',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL003'],
        },
        secondOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G2',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL022'],
        },
        secondOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G3',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL041'],
        },
        secondOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G4',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL060'],
        },
        secondOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
      },
      {
        key: 'World_Around_Us_Textbook_Student_Ratio_G5',
        operator: 'DIVIDE',
        firstOperand: {
          dataValues: ['STCL079'],
        },
        secondOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
      },
    ],
    [
      {
        key: 'World_Around_Us_Shortage_Ratio_G1',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop011', 'SchPop012'],
        },
        secondOperand: {
          dataValues: ['STCL003'],
        },
      },
      {
        key: 'World_Around_Us_Shortage_Ratio_G2',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop013', 'SchPop014'],
        },
        secondOperand: {
          dataValues: ['STCL022'],
        },
      },
      {
        key: 'World_Around_Us_Shortage_Ratio_G3',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop015', 'SchPop016'],
        },
        secondOperand: {
          dataValues: ['STCL041'],
        },
      },
      {
        key: 'World_Around_Us_Shortage_Ratio_G4',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop017', 'SchPop018'],
        },
        secondOperand: {
          dataValues: ['STCL060'],
        },
      },
      {
        key: 'World_Around_Us_Shortage_Ratio_G5',
        operator: 'SUBTRACT',
        firstOperand: {
          dataValues: ['SchPop019', 'SchPop020'],
        },
        secondOperand: {
          dataValues: ['STCL079'],
        },
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
