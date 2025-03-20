'use strict';

import { insertObject } from '../utilities';

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

const MAP_OVERLAY_ID = 'Laos_Schools_School_Indicators_Distance_From_Main_Road';

const NAME = 'Distance from Main Road';

const DATA_ELEMENT_CODE = 'SchDISmr';

const GROUP_NAME = 'School Indicators';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'color';

const MEASURE_BUILDER = 'groupData';

const MEASURE_BUILDER_CONFIG = {
  groups: {
    '<1': {
      value: 1,
      operator: '<',
    },
    '1-10': {
      value: [1, 10],
      operator: 'range',
    },
    '>10': {
      value: 10,
      operator: '>',
    },
  },
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
  },
};

const COUNTRY_CODES = '{"LA"}';

const PROJECT_CODES = '{"laos_schools"}';

const VALUES = [
  {
    name: 'Less than 1 km',
    color: 'Red',
    value: '<1',
  },
  {
    name: '1 - 10 km',
    color: 'Blue',
    value: '1-10',
  },
  {
    name: 'Greater than 10 km',
    color: 'Green',
    value: '>10',
  },
  {
    name: 'No data',
    color: 'Grey',
    value: 'null',
  },
];

const PRESENTATION_OPTIONS = {
  hideByDefault: {
    null: true,
  },
  displayOnLevel: 'District',
  measureLevel: 'School',
  popupHeaderFormat: '{code}: {name}',
};

const getLargestSortOrderOfGroup = async db =>
  db.runSql(
    `SELECT "sortOrder" FROM "mapOverlay" WHERE "groupName" = '${GROUP_NAME}' ORDER BY "sortOrder" DESC LIMIT 1;`,
  );

const MAP_OVERLAY_OBJECT = {
  id: MAP_OVERLAY_ID,
  name: NAME,
  dataElementCode: DATA_ELEMENT_CODE,
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
  const largestSortOrderOfGroup = (await getLargestSortOrderOfGroup(db)).rows[0].sortOrder;

  await insertObject(db, 'mapOverlay', {
    ...MAP_OVERLAY_OBJECT,
    sortOrder: largestSortOrderOfGroup + 1,
  });
};

exports.down = function (db) {
  return db.runSql(`	
    DELETE FROM "mapOverlay" 
    WHERE "id" = '${MAP_OVERLAY_ID}';	
  `);
};

exports._meta = {
  version: 1,
};
