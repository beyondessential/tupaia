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

const REPORT_ID = 'Laos_Schools_Teaching_and_Learning_School_Table';

const DATA_BUILDER_CONFIG = {
  rows: [
    'Remedial support provided to students by the school',
    'Support implementing catch-up/remedial teaching programmes received',
    'Additional learning and reading materials received since June 2020',
    'Teachers follow the MoES education programmes at home',
    'Students follow the MoES education programmes at home',
    'MoES education programmes on TV/radio/online considered useful for supporting continuity of student learning when schools were closed',
    'Training on digital literacy and MoES website resources received',
  ],
  cells: [
    ['SchFF011'],
    ['SchCVD020'],
    ['SchCVD004b'],
    [
      'SchCVD016',
      {
        key: 'How_Teachers_Follow_MoES_At_Home',
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          SchCVD016a: 'TV',
          SchCVD016b: 'Radio',
          SchCVD016c: 'Online',
        },
      },
    ],
    [
      'SchCVD017',
      {
        key: 'How_Students_Follow_MoES_At_Home',
        operator: 'COMBINE_BINARY_AS_STRING',
        dataElementToString: {
          SchCVD017a: 'TV',
          SchCVD017b: 'Radio',
          SchCVD017c: 'Online',
        },
      },
    ],
    ['SchCVD017d'],
    ['SchCVD019'],
  ],
  columns: ['Main', 'Extra'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Teaching and Learning',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  hideColumnTitles: true,
  presentationOptions: {
    Yes: {
      color: 'green',
      label: '',
      description: "**Green** indicates 'Yes' to the corresponding indicator.\n",
    },
    No: {
      color: 'red',
      label: '',
      description: "**Red** indicates 'No' to the corresponding indicator.\n",
    },
    '': {
      color: 'grey',
      label: '',
      description: "**Grey** indicates 'No data' for the corresponding indicator.\n",
    },
    applyLocation: {
      columnIndexes: [0],
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
