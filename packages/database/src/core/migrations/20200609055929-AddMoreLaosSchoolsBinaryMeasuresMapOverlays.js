'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const VALUES = [
  {
    name: 'Yes',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'No',
    color: 'red',
    value: 'No',
  },
];

const COMPUTER_PROVIDED_MAP_OVERLAY_VALUES = [
  {
    name: 'Less than 1 year ago',
    color: 'yellow',
    value: 'less than 1 year ago',
  },
  {
    name: 'Less than 2 years ago',
    color: 'teal',
    value: 'less than 2 years ago',
  },
  {
    name: 'Less than 3 years ago',
    color: 'green',
    value: 'less than 3 years ago',
  },
  {
    name: 'Over 4 years ago',
    color: 'orange',
    value: 'over 4 years ago',
  },
];

const LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_Used_As_Quarantine_Centre',
    name: 'Has been used as quarantine centre',
    dataElementCode: 'SchCVD002',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Disinfected_By_District_Health_Office',
    name: 'Disinfected by district health office',
    dataElementCode: 'SchCVD003',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Functioning_Water_Filters',
    name: 'Functioning water filters',
    dataElementCode: 'SchCVD009',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Textbook_Additional_Learning_Material',
    name: 'Textbooks and additional learning material received',
    dataElementCode: 'SchCVD004',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_COVID_Posters_And_Materials',
    name: 'COVID-19 posters and materials received',
    dataElementCode: 'SchCVD006',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Thermometers_Received',
    name: 'Thermometer(s) received for taking temperature',
    dataElementCode: 'SchCVD024',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Hygiene_Promotion',
    name: 'Hygiene promotion training in last 3 years',
    dataElementCode: 'SchCVD007',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Functioning_TV_Satellite',
    name: 'Functioning TV, satellite receiver and dish set',
    dataElementCode: 'SchCVD012',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Functioning_Notebook_Laptop',
    name: 'Functioning notebook/laptop or desktop computer',
    dataElementCode: 'SchCVD013',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_When_Was_Computer_Provided',
    name: 'When was computer provided',
    dataElementCode: 'SchCVD014',
    values: COMPUTER_PROVIDED_MAP_OVERLAY_VALUES,
  },
  {
    id: 'Laos_Schools_Functioning_Projector',
    name: 'Functioning projector',
    dataElementCode: 'SchCVD015',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Teachers_Follow_MoES_Education_Show',
    name: 'Teachers follow the MoES education shows on TV',
    dataElementCode: 'SchCVD016',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Students_Follow_MoES_Education_Show',
    name: 'Students follow the MoES education shows on TV',
    dataElementCode: 'SchCVD017',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Teachers_Using_Resources_On_MoES_Website',
    name: 'Teachers using resources on MoES website',
    dataElementCode: 'SchCVD018',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Traning_On_Digital_Literacy_And_MoES_Website_Resources_Received',
    name: 'Training on digital literacy and MoES website resources received',
    dataElementCode: 'SchCVD019',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Support_Implementing_Catch_Up-Teaching_Programmes_Received',
    name: 'Support implementing catch-up/remedial teaching programmes received',
    dataElementCode: 'SchCVD020',
    values: VALUES,
  },
  {
    id: 'Laos_Schools_Students_Required_Psychosocial_SUpport',
    name: 'Students require psychosocial support',
    dataElementCode: 'SchCVD021',
    values: VALUES,
  },
];

const GROUP_NAME = 'School Indicators';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'color';

const MEASURE_BUILDER = 'valueForOrgGroup';

const MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const COUNTRY_CODES = '{"LA"}';

const PROJECT_CODES = '{"laos_schools"}';

const PRESENTATION_OPTIONS = {
  hideByDefault: {
    null: true,
  },
  measureLevel: 'School',
  displayOnLevel: 'District',
};

const BASIC_LAOS_SCHOOL_MAP_OVERLAY_OBJECT = {
  groupName: GROUP_NAME,
  userGroup: USER_GROUP,
  displayType: DISPLAY_TYPE,
  isDataRegional: true,
  measureBuilder: MEASURE_BUILDER,
  measureBuilderConfig: MEASURE_BUILDER_CONFIG,
  presentationOptions: PRESENTATION_OPTIONS,
  countryCodes: COUNTRY_CODES,
  projectCodes: PROJECT_CODES,
};

const getLargestSortOrderOfGroup = async db =>
  db.runSql(
    `SELECT "sortOrder" FROM "mapOverlay" WHERE "groupName" = '${GROUP_NAME}' ORDER BY "sortOrder" DESC LIMIT 1;`,
  );

exports.up = async function (db) {
  const largestSortOrderOfGroup = (await getLargestSortOrderOfGroup(db)).rows[0].sortOrder;

  await Promise.all(
    LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS.map((overlay, index) => {
      const sortOrder = largestSortOrderOfGroup + index + 1;
      const { name, id, dataElementCode, values } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASIC_LAOS_SCHOOL_MAP_OVERLAY_OBJECT,
        name,
        id,
        dataElementCode,
        values,
        sortOrder,
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(`	
    DELETE FROM "mapOverlay" 
    WHERE "id" in (${arrayToDbString(LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS.map(o => o.id))});	
  `);
};

exports._meta = {
  version: 1,
};
