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

const LAOS_SCHOOLS_CHILDREN_MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_Children_Supported_With_TV_Programmes_Radio',
    name: 'Number of children supported with TV programmes and radio',
    dataElementCode: 'SchFF006',
  },
  {
    id: 'Laos_Schools_Children_Supported_With_Learning_Materials',
    name:
      'Number of children supported with Learning materials made available on MoES website in their lessons',
    dataElementCode: 'SchFF007',
  },
  {
    id: 'Laos_Schools_Children_Provided_Psychosocial_Support',
    name: 'Number of children provided with psychosocial support',
    dataElementCode: 'SchFF017',
  },
];

const GROUP_NAME = 'Number of Children';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'spectrum';

const MEASURE_BUILDER = 'valueForOrgGroup';

const MEASURE_BUILDER_CONFIG = {
  dataSourceEntityType: 'school',
  aggregationEntityType: 'school',
};

const COUNTRY_CODES = '{"LA"}';

const VALUES = [
  { color: 'blue', value: 'other' },
  { color: 'grey', value: null },
];

const PRESENTATION_OPTIONS = {
  scaleMin: 0,
  scaleType: 'population',
  displayOnLevel: 'District',
  hideByDefault: {
    null: true,
  },
};

const BASIC_CHILDREN_MAP_OVERLAY_OBJECT = {
  groupName: GROUP_NAME,
  userGroup: USER_GROUP,
  displayType: DISPLAY_TYPE,
  isDataRegional: true,
  measureBuilder: MEASURE_BUILDER,
  measureBuilderConfig: MEASURE_BUILDER_CONFIG,
  values: VALUES,
  presentationOptions: PRESENTATION_OPTIONS,
  countryCodes: COUNTRY_CODES,
};

exports.up = async function (db) {
  await Promise.all(
    LAOS_SCHOOLS_CHILDREN_MAP_OVERLAYS.map((overlay, index) => {
      const { name, id, dataElementCode } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASIC_CHILDREN_MAP_OVERLAY_OBJECT,
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
    WHERE "id" in (${arrayToDbString(LAOS_SCHOOLS_CHILDREN_MAP_OVERLAYS.map(o => o.id))});	
  `);
};

exports._meta = {
  version: 1,
};
