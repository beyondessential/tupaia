'use strict';

import { generateId, insertObject, arrayToDbString } from '../utilities';

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

const MAP_OVERLAY_ID = 'Laos_Schools_School_Indicators_Functioning_Computer';

const NAME = 'Functioning computer';

const DATA_ELEMENT_CODE = 'value';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'color';

const MEASURE_BUILDER = 'valueForOrgGroup';

const MEASURE_BUILDER_CONFIG = {
  filter: {
    value: {
      in: [
        'Provided less than 1 year ago',
        'Provided less than 2 years ago',
        'Provided less than 3 years ago',
        'Provided over 4 years ago',
        'No',
      ],
    },
  },
  dataElementCodes: ['SchCVD013', 'SchCVD014'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const COUNTRY_CODES = '{"LA"}';

const PROJECT_CODES = '{"laos_schools"}';

const VALUES = [
  {
    name: 'Yes, provided less than 1 year ago',
    color: 'yellow',
    value: 'Provided less than 1 year ago',
  },
  {
    name: 'Yes, provided less than 2 years ago',
    color: 'blue',
    value: 'Provided less than 2 years ago',
  },
  {
    name: 'Yes, provided less than 3 years ago',
    color: 'teal',
    value: 'Provided less than 3 years ago',
  },
  {
    name: 'Yes, provided over 4 years ago',
    color: 'green',
    value: 'Provided over 4 years ago',
  },
  {
    name: 'No',
    color: 'red',
    value: 'No',
  },
];

const PRESENTATION_OPTIONS = {
  displayType: DISPLAY_TYPE,
  values: VALUES,
  hideByDefault: {
    null: true,
  },
  displayOnLevel: 'District',
  measureLevel: 'School',
  popupHeaderFormat: '{code}: {name}',
};

const OLD_OVERLAY_SORT_ORDER = 19;

const MAP_OVERLAY_OBJECT = {
  id: MAP_OVERLAY_ID,
  name: NAME,
  dataElementCode: DATA_ELEMENT_CODE,
  userGroup: USER_GROUP,
  isDataRegional: true,
  measureBuilder: MEASURE_BUILDER,
  measureBuilderConfig: MEASURE_BUILDER_CONFIG,
  presentationOptions: PRESENTATION_OPTIONS,
  countryCodes: COUNTRY_CODES,
  projectCodes: PROJECT_CODES,
  sortOrder: OLD_OVERLAY_SORT_ORDER,
};

const OVERLAY_IDS_TO_REMOVE = [
  'Laos_Schools_Functioning_Notebook_Laptop',
  'Laos_Schools_When_Was_Computer_Provided',
];

const selectSchoolIndicatorsEiEGroup = async db =>
  db.runSql(`SELECT * FROM map_overlay_group where code = 'School_Indicators_EiE'`);

exports.up = async function (db) {
  const group = (await selectSchoolIndicatorsEiEGroup(db)).rows[0];

  await insertObject(db, 'mapOverlay', MAP_OVERLAY_OBJECT);

  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: group.id,
    child_id: MAP_OVERLAY_OBJECT.id,
    child_type: 'mapOverlay',
  });

  // Remove these 2 map overlays and add a new consolidated one
  await db.runSql(`	
    DELETE FROM "mapOverlay" 
    WHERE id IN (${arrayToDbString(OVERLAY_IDS_TO_REMOVE)});
  `);
};

exports.down = function (db) {
  return null; // No migration down
};

exports._meta = {
  version: 1,
};
