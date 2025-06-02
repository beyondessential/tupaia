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

const LAOS_SCHOOL_DROP_OUT_MAP_OVERLAYS = [
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_1_Province',
    name: 'Total drop-out rate in grade 1',
    dataElementCode: 'SchDropProv001',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_2_Province',
    name: 'Total drop-out rate in grade 2',
    dataElementCode: 'SchDropProv004',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_3_Province',
    name: 'Total drop-out rate in grade 3',
    dataElementCode: 'SchDropProv007',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_4_Province',
    name: 'Total drop-out rate in grade 4',
    dataElementCode: 'SchDropProv010',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_5_Province',
    name: 'Total drop-out rate in grade 5',
    dataElementCode: 'SchDropProv013',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_6_Province',
    name: 'Total drop-out rate in grade 6',
    dataElementCode: 'SchDropProv019',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_7_Province',
    name: 'Total drop-out rate in grade 7',
    dataElementCode: 'SchDropProv022',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_8_Province',
    name: 'Total drop-out rate in grade 8',
    dataElementCode: 'SchDropProv025',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_9_Province',
    name: 'Total drop-out rate in grade 9',
    dataElementCode: 'SchDropProv028',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_10_Province',
    name: 'Total drop-out rate in grade 10',
    dataElementCode: 'SchDropProv034',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_11_Province',
    name: 'Total drop-out rate in grade 11',
    dataElementCode: 'SchDropProv037',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Grade_12_Province',
    name: 'Total drop-out rate in grade 12',
    dataElementCode: 'SchDropProv040',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Primary_Province',
    name: 'Total drop-out rate in primary school',
    dataElementCode: 'SchDropProv016',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Lower_Secondary_Province',
    name: 'Total drop-out rate in lower secondary school',
    dataElementCode: 'SchDropProv031',
  },
  {
    id: 'Laos_Schools_Total_Drop_Out_Upper_Secondary_Province',
    name: 'Total drop-out rate in upper secondary school',
    dataElementCode: 'SchDropProv043',
  },
];

const USER_GROUP = 'Laos Schools User';

const DISPLAY_TYPE = 'shaded-spectrum';

const MEASURE_BUILDER = 'valueForOrgGroup';

const MEASURE_BUILDER_CONFIG = {
  dataSourceEntityType: 'district',
  aggregationEntityType: 'district',
};

const COUNTRY_CODES = '{"LA"}';

const GROUP_NAME = 'Total Drop-out Rate in Province';

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

const PRESENTATION_OPTIONS = {
  scaleMin: 0,
  scaleMax: 'auto',
  scaleType: 'performanceDesc',
  valueType: 'percentage',
};

const BASIC_MAP_OVERLAY_OBJECT = {
  userGroup: USER_GROUP,
  groupName: GROUP_NAME,
  displayType: DISPLAY_TYPE,
  isDataRegional: true,
  values: VALUES,
  measureBuilder: MEASURE_BUILDER,
  measureBuilderConfig: MEASURE_BUILDER_CONFIG,
  presentationOptions: PRESENTATION_OPTIONS,
  countryCodes: COUNTRY_CODES,
};

const insertMapOverlays = async (db, mapOverlays, basicConfig) => {
  await Promise.all(
    mapOverlays.map((overlay, index) => {
      const { name, id, dataElementCode } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...basicConfig,
        name,
        id,
        dataElementCode,
        sortOrder: index,
      });
    }),
  );
};

exports.up = async function (db) {
  await insertMapOverlays(db, LAOS_SCHOOL_DROP_OUT_MAP_OVERLAYS, BASIC_MAP_OVERLAY_OBJECT);
};

exports.down = function (db) {
  return db.runSql(`	
    DELETE FROM "mapOverlay" 
    WHERE "id" in (${arrayToDbString(LAOS_SCHOOL_DROP_OUT_MAP_OVERLAYS.map(o => o.id))});
  `);
};

exports._meta = {
  version: 1,
};
