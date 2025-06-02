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

const LAOS_SCHOOL_STUDENT_RESOURCES_MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_Students_Have_Own_Textbooks',
    name: 'Students have their own textbooks',
    dataElementCode: 'SchCVD005',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_1',
    name: 'Students have textbooks in grade 1',
    dataElementCode: 'SchCVD005G1',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_2',
    name: 'Students have textbooks in grade 2',
    dataElementCode: 'SchCVD005G2',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_3',
    name: 'Students have textbooks in grade 3',
    dataElementCode: 'SchCVD005G3',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_4',
    name: 'Students have textbooks in grade 4',
    dataElementCode: 'SchCVD005G4',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_5',
    name: 'Students have textbooks in grade 5',
    dataElementCode: 'SchCVD005G5',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_6',
    name: 'Students have textbooks in grade 6/M1',
    dataElementCode: 'SchCVD005G6',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_7',
    name: 'Students have textbooks in grade 7/M2',
    dataElementCode: 'SchCVD005G7',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_8',
    name: 'Students have textbooks in grade 8/M3',
    dataElementCode: 'SchCVD005G8',
  },
  {
    id: 'Laos_Schools_Students_Have_Textbooks_Grade_9',
    name: 'Students have textbooks in grade 9/M4',
    dataElementCode: 'SchCVD005G9',
  },
];

const GROUP_NAME = 'Student Resources';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'color';

const MEASURE_BUILDER = 'valueForOrgGroup';

const MEASURE_BUILDER_CONFIG = {
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
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
  values: VALUES,
  measureBuilder: MEASURE_BUILDER,
  measureBuilderConfig: MEASURE_BUILDER_CONFIG,
  presentationOptions: PRESENTATION_OPTIONS,
  countryCodes: COUNTRY_CODES,
  projectCodes: PROJECT_CODES,
};

exports.up = async function (db) {
  await Promise.all(
    LAOS_SCHOOL_STUDENT_RESOURCES_MAP_OVERLAYS.map((overlay, index) => {
      const { name, id, dataElementCode } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASIC_LAOS_SCHOOL_MAP_OVERLAY_OBJECT,
        name,
        id,
        dataElementCode,
        sortOrder: index,
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(`	
    DELETE FROM "mapOverlay" 
    WHERE "id" in (${arrayToDbString(LAOS_SCHOOL_STUDENT_RESOURCES_MAP_OVERLAYS.map(o => o.id))});	
  `);
};

exports._meta = {
  version: 1,
};
