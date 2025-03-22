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
  'Laos_Schools_School_Textbooks_Shortage_By_Key_Subjects_And_Grades_Upper_Secondary_School';

const DATA_BUILDER_CONFIG = {
  rows: [
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'Lao Language And Literature',
    },
    {
      rows: ['Textbook-student ratio', 'Shortage'],
      category: 'Mathematics',
    },
  ],
  cells: [
    [
      {
        key: 'Lao_Language_Literature_Student_Ratio_G10',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL080'],
          },
          {
            dataValues: ['SchPop029', 'SchPop030'],
          },
        ],
      },
      {
        key: 'Lao_Language_Literature_Student_Ratio_G11',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL096'],
          },
          {
            dataValues: ['SchPop031', 'SchPop032'],
          },
        ],
      },
      {
        key: 'Lao_Language_Literature_Student_Ratio_G12',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL112'],
          },
          {
            dataValues: ['SchPop033', 'SchPop034'],
          },
        ],
      },
    ],
    [
      {
        key: 'Lao_Language_Literature_Shortage_G10',
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop029', 'SchPop030'],
          },
          {
            dataValues: ['STCL080'],
          },
        ],
      },
      {
        key: 'Lao_Language_Literature_Shortage_G11',
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop031', 'SchPop032'],
          },
          {
            dataValues: ['STCL096'],
          },
        ],
      },
      {
        key: 'Lao_Language_Literature_Shortage_G12',
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop033', 'SchPop034'],
          },
          {
            dataValues: ['STCL112'],
          },
        ],
      },
    ],
    [
      {
        key: 'Mathematics_Textbook_Student_Ratio_G10',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL081'],
          },
          {
            dataValues: ['SchPop029', 'SchPop030'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G11',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL097'],
          },
          {
            dataValues: ['SchPop031', 'SchPop032'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Student_Ratio_G12',
        operator: 'DIVIDE',
        operands: [
          {
            dataValues: ['STCL113'],
          },
          {
            dataValues: ['SchPop033', 'SchPop034'],
          },
        ],
      },
    ],
    [
      {
        key: 'Mathematics_Textbook_Shortage_G10',
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop029', 'SchPop030'],
          },
          {
            dataValues: ['STCL081'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Shortage_G11',
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop031', 'SchPop032'],
          },
          {
            dataValues: ['STCL097'],
          },
        ],
      },
      {
        key: 'Mathematics_Textbook_Shortage_G12',
        operator: 'SUBTRACT',
        operands: [
          {
            dataValues: ['SchPop033', 'SchPop034'],
          },
          {
            dataValues: ['STCL113'],
          },
        ],
      },
    ],
  ],
  columns: ['Grade 10', 'Grade 11', 'Grade 12'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Textbooks Shortage by Key Subjects and Grades: Upper Secondary',
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
