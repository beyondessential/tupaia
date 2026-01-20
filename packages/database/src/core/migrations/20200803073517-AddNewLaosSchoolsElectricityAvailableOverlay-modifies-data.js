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

const MAP_OVERLAY_ID = 'Laos_Schools_School_Indicators_Electricity_Available';

const NAME = 'Electricity Available';

const DATA_ELEMENT_CODE = 'value';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'color';

const MEASURE_BUILDER = 'valueForOrgGroup';

const MEASURE_BUILDER_CONFIG = {
  filter: {
    value: {
      in: [
        'Yes',
        'Distance to grid under 0.5km',
        'Distance to grid 0.5 to 1km',
        'Distance to grid 1 to 2km',
        'Distance to grid 2 to 4km',
        'Distance to grid over 5km',
      ],
    },
  },
  dataElementCodes: ['SchFF001', 'SchCVD011'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const COUNTRY_CODES = '{"LA"}';

const PROJECT_CODES = '{"laos_schools"}';

const VALUES = [
  {
    name: 'Yes',
    color: 'green',
    value: 'Yes',
  },
  {
    name: 'No, distance to grid under 0.5km',
    color: 'blue',
    value: 'Distance to grid under 0.5km',
  },
  {
    name: 'No, distance to grid 0.5 to 1km',
    color: 'teal',
    value: 'Distance to grid 0.5 to 1km',
  },
  {
    name: 'No, distance to grid 1 to 2km',
    color: 'yellow',
    value: 'Distance to grid 1 to 2km',
  },
  {
    name: 'No, distance to grid 2 to 4km',
    color: 'orange',
    value: 'Distance to grid 2 to 4km',
  },
  {
    name: 'No, distance to grid over 5km',
    color: 'pink',
    value: 'Distance to grid over 5km',
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

const OLD_OVERLAY_SORT_ORDER = 0;

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

const OVERLAY_IDS_TO_REMOVE = ['Laos_Schools_Electricity_Available'];

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

  // Remove the old map overlay and add a new consolidated one
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
