'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const GROUP_NAME = 'Population';

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
  scaleMax: 'auto',
  scaleMin: 0,
  scaleType: 'neutral',
  valueType: 'number',
};

const BASE_MAP_OVERLAY_OBJECT = {
  dataElementCode: DATA_ELEMENT_CODE,
  groupName: GROUP_NAME,
  userGroup: USER_GROUP,
  displayType: DISPLAY_TYPE,
  values: VALUES,
  isDataRegional: true,
  measureBuilder: MEASURE_BUILDER,
  countryCodes: COUNTRY_CODES,
  projectCodes: PROJECT_CODES,
};

exports.up = async function(db) {
  await Promise.all(
    MAP_OVERLAYS.map((overlay, index) => {
      const { name, id, aggregationEntityType, measureLevel } = overlay;
      return insertObject(db, 'mapOverlay', {
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
    }),
  );
};

exports.down = function(db) {
  return db.runSql(`	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(MAP_OVERLAYS.map(o => o.id))});	
  `);
};

exports._meta = {
  version: 1,
};
