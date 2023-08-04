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

const LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_Electricity_Available',
    name: 'Electricity available in school',
    dataElementCode: 'SchFF001',
  },
  {
    id: 'Laos_Schools_Internet_Connection_Available_In_School',
    name: 'Internet connection available in school',
    dataElementCode: 'SchFF002',
  },
  {
    id: 'Laos_Schools_Functioning_Water_Supply',
    name: 'Functioning water supply',
    dataElementCode: 'BCD29_event',
  },
  {
    id: 'Laos_Schools_Functioning_Toilet',
    name: 'Functioning toilet (vs. unusable)',
    dataElementCode: 'BCD32_event',
  },
  {
    id: 'Laos_Schools_Hand_Washing_Facility_Available',
    name: 'Hand washing facility available',
    dataElementCode: 'SchFF004',
  },
  {
    id: 'Laos_Schools_Schools_Received_Learning_Materials',
    name:
      'Schools that received (hard copies of) learning materials for (remote) communities with limited internet and TV access',
    dataElementCode: 'SchFF008',
  },
  {
    id: 'Laos_Schools_Schools_Used_As_Quarantine',
    name: 'Schools used as quarantine centres',
    dataElementCode: 'SchQuar001',
  },
  {
    id: 'Laos_Schools_Schools_Provided_With_Cleaning_Materials',
    name:
      'Schools provided with cleaning/disinfecting materials and guidance provided on their use',
    dataElementCode: 'SchFF009',
  },
  {
    id: 'Laos_Schools_Schools_Provided_With_Hygiene_Kids',
    name: 'Schools provided with hygiene kids',
    dataElementCode: 'SchFF009a',
  },
  {
    id: 'Laos_Schools_Schools_Received_Training_On_Safe_Protocols',
    name: 'Schools received training on safe school protocols (COVID-19 prevention and control)',
    dataElementCode: 'SchFF010',
  },
  {
    id: 'Laos_Schools_Schools_Implementing_Remedial_Education_Programmes',
    name: 'Schools implementing remedial education programmes',
    dataElementCode: 'SchFF011',
  },
  {
    id: 'Laos_Schools_Schools_Provided_With_Psychosocial_Support',
    name: 'Schools provided with psychosocial support',
    dataElementCode: 'SchFF016',
  },
];

const GROUP_NAME = 'Laos Schools';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'color';

const MEASURE_BUILDER = 'valueForOrgGroup';

const MEASURE_BUILDER_CONFIG = {
  dataSourceEntityType: 'school',
  aggregationEntityType: 'school',
};

const COUNTRY_CODES = '{"LA"}';

const VALUES = [
  {
    name: 'Yes',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'No',
    color: 'red',
    value: ['No', 'null'],
  },
];

const PRESENTATION_OPTIONS = {
  hideByDefault: {
    'No,null': true,
  },
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
};

exports.up = async function (db) {
  await Promise.all(
    LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS.map((overlay, index) => {
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
    WHERE "id" in (${arrayToDbString(LAOS_SCHOOL_BINARY_MEASURE_MAP_OVERLAYS.map(o => o.id))});	
  `);
};

exports._meta = {
  version: 1,
};
