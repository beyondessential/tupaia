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

const MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_Population_Total_Population_District_Level',
    name: 'Total population in district',
    aggregationEntityType: 'sub_district',
    measureLevel: 'SubDistrict',
  },
  {
    id: 'Laos_Schools_Population_Total_Population_Province_Level',
    name: 'Total population in province',
    aggregationEntityType: 'district',
    measureLevel: 'District',
  },
];

const DATA_ELEMENT_CODE = 'value';

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'shaded-spectrum';

const VALUES = [
  {
    color: 'blue',
    value: 'other',
  },
  {
    color: 'grey',
    value: null,
  },
];

const MEASURE_BUILDER = 'sumLatestPerOrgUnit';

const BASE_ENTITY_AGGREGATION = {
  aggregationType: 'SUM_PER_ORG_GROUP',
  dataSourceEntityType: 'sub_district',
};

const BASE_MEASURE_BUILDER_CONFIG = {
  dataElementCodes: ['SDP001'],
};

const COUNTRY_CODES = '{"LA"}';

const PROJECT_CODES = '{"laos_schools"}';

const BASE_PRESENTATION_OPTIONS = {
  displayType: DISPLAY_TYPE,
  values: VALUES,
  scaleMax: 'auto',
  scaleMin: 0,
  scaleType: 'neutral',
  valueType: 'number',
};

const BASE_MAP_OVERLAY_OBJECT = {
  dataElementCode: DATA_ELEMENT_CODE,
  userGroup: USER_GROUP,
  isDataRegional: true,
  measureBuilder: MEASURE_BUILDER,
  countryCodes: COUNTRY_CODES,
  projectCodes: PROJECT_CODES,
};

const POPULATION_GROUP = {
  id: generateId(),
  name: 'Population',
  code: 'Laos_Schools_Population_Group',
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', POPULATION_GROUP);

  for (let index = 0; index < MAP_OVERLAYS.length; index++) {
    const { name, id, aggregationEntityType, measureLevel } = MAP_OVERLAYS[index];

    await insertObject(db, 'mapOverlay', {
      ...BASE_MAP_OVERLAY_OBJECT,
      name,
      id,
      measureBuilderConfig: {
        ...BASE_MEASURE_BUILDER_CONFIG,
        entityAggregation: { ...BASE_ENTITY_AGGREGATION, aggregationEntityType },
      },
      presentationOptions: {
        ...BASE_PRESENTATION_OPTIONS,
        measureLevel,
      },
      sortOrder: index,
    });

    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: POPULATION_GROUP.id,
      child_id: id,
      child_type: 'mapOverlay',
    });
  }
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM map_overlay_group_relation WHERE child_id in (${arrayToDbString(
      MAP_OVERLAYS.map(o => o.id),
    )});

    DELETE FROM "mapOverlay" WHERE id in (${arrayToDbString(MAP_OVERLAYS.map(o => o.id))});

    DELETE FROM map_overlay_group WHERE code = '${POPULATION_GROUP.code}';
  `);
};

exports._meta = {
  version: 1,
};
