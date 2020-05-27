'use strict';

import { insertObject } from '../utilities';

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

const DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_District_Laos_Schools_User';
const REPORT = {
  id: 'Laos_Schools_Binary_Matrix_Availability_By_School_District',
  dataBuilder: 'tableOfValuesForOrgUnits',
  dataBuilderConfig: {
    rows: [
      'Electricity',
      'Internet connection',
      'Dormitory school',
      'Functioning water supply',
      'Functioning toilet',
      'Hand washing facility',
      'Learning materials for communities',
      'Cleaning/disinfecting materials',
      'Hygiene kits',
      'Training on safe school protocol',
      'Remedial education programmes',
      'Provided psychosocial support',
      'COVID-19 quarantine centre',
    ],
    cells: [
      'SchFF001',
      'SchFF002',
      'SchFF003',
      'BCD29_event',
      'BCD32_event',
      'SchFF004',
      'SchFF008',
      'SchFF009',
      'SchFF009a',
      'SchFF010',
      'SchFF011',
      'SchFF016',
      'SchQuar001',
    ],
    columns: '$orgUnit',
    dataSourceEntityType: 'school',
  },
  viewJson: {
    name: 'School Utility/Resource Availability',
    type: 'matrix',
    placeholder: '/static/media/PEHSMatrixPlaceholder.png',
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
    },
  },
};

exports.up = async function(db) {
  await insertObject(db, 'dashboardReport', REPORT);
  await db.runSql(`	
    UPDATE "dashboardGroup"
    SET "dashboardReports" = "dashboardReports" || '{${REPORT.id}}'
    WHERE code = '${DASHBOARD_GROUP_CODE}';
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
