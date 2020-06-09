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
      'Internet connection available',
      'Dormitory school',
      'Access to clean water',
      'Functioning toilets',
      'Functioning hand washing facilities',
      // 'Learning materials for communities',
      // 'Cleaning/disinfecting materials',
      // 'Hygiene kits',
      // 'Training on safe school protocol',
      'Remedial support provided to students',
      // 'Provided psychosocial support',
      'Currently used as quarantine centre',

      //New (order is important here)
      'Has been used as quarantine centre',
      'Disinfected by district health office',
      'Functioning water filters',
      'Textbooks and additional learning material received',
      'Students have their own textbooks',
      'COVID-19 posters and materials received',
      'Thermometer(s) received for taking temperature',
      'Hygiene promotion training in last 3 years',
      'Functioning TV, satellite receiver and dish set',
      'Functioning notebook/laptop or desktop computer',
      'Functioning projector',
      'Teachers follow the MoES education shows on TV',
      'Students follow the MoES education shows on TV',
      'Teachers using resources on MoES website',
      'Training on digital literacy and MoES website resources received',
      'Support implementing catch-up/remedial teaching programmes received',
      'Students require psychosocial support',
    ],
    cells: [
      'SchFF001',
      'SchFF002',
      'SchFF003',
      'BCD29_event',
      'BCD32_event',
      'SchFF004',
      // 'SchFF008',
      // 'SchFF009',
      // 'SchFF009a',
      // 'SchFF010',
      'SchFF011',
      // 'SchFF016',
      'SchQuar001',

      //New
      'SchCVD002',
      'SchCVD003',
      'SchCVD009',
      'SchCVD004',
      'SchCVD005',
      'SchCVD006',
      'SchCVD024',
      'SchCVD007',
      'SchCVD012',
      'SchCVD013',
      'SchCVD015',
      'SchCVD016',
      'SchCVD017',
      'SchCVD018',
      'SchCVD019',
      'SchCVD020',
      'SchCVD021',
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
