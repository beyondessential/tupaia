'use strict';

import { insertObject, generateId } from '../utilities';

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
const FEMALE_DATA_ELEMENTS = [
  'SchPop009',
  'SchPop011',
  'SchPop013',
  'SchPop015',
  'SchPop017',
  'SchPop019',
  'SchPop021',
  'SchPop023',
  'SchPop025',
  'SchPop027',
  'SchPop029',
  'SchPop031',
  'SchPop033',
];

const MALE_DATA_ELEMENTS = [
  'SchPop010',
  'SchPop012',
  'SchPop014',
  'SchPop016',
  'SchPop018',
  'SchPop020',
  'SchPop022',
  'SchPop024',
  'SchPop026',
  'SchPop028',
  'SchPop030',
  'SchPop032',
  'SchPop034',
];

const OVERLAYS_IN_HIERARCHY = {
  Laos_Schools_Student_Numbers_Group: {
    Laos_Schools_Student_Numbers_School_Level_Group: [],
    Laos_Schools_Student_Numbers_District_Level_Group: [
      {
        id: 'Laos_Schools_Student_Numbers_District_Level_Total_Students',
        name: 'Total students',
        dataElementCodes: [...FEMALE_DATA_ELEMENTS, ...MALE_DATA_ELEMENTS],
        aggregationLevel: 'SubDistrict',
      },
      {
        id: 'Laos_Schools_Student_Numbers_District_Level_Female_Students',
        name: 'Female students',
        dataElementCodes: FEMALE_DATA_ELEMENTS,
        aggregationLevel: 'SubDistrict',
      },
      {
        id: 'Laos_Schools_Student_Numbers_District_Level_Male_Students',
        name: 'Male students',
        dataElementCodes: MALE_DATA_ELEMENTS,
        aggregationLevel: 'SubDistrict',
      },
    ],
    Laos_Schools_Student_Numbers_Provincial_Level_Group: [
      {
        id: 'Laos_Schools_Student_Numbers_Province_Level_Total_Students',
        name: 'Total students',
        dataElementCodes: [...FEMALE_DATA_ELEMENTS, ...MALE_DATA_ELEMENTS],
        aggregationLevel: 'District',
      },
      {
        id: 'Laos_Schools_Student_Numbers_Province_Level_Female_Students',
        name: 'Female students',
        dataElementCodes: FEMALE_DATA_ELEMENTS,
        aggregationLevel: 'District',
      },
      {
        id: 'Laos_Schools_Student_Numbers_Province_Level_Male_Students',
        name: 'Male students',
        dataElementCodes: MALE_DATA_ELEMENTS,
        aggregationLevel: 'District',
      },
    ],
  },
};

const GROUP_CODE_TO_NAME = {
  Laos_Schools_Student_Numbers_Group: 'Student Numbers',
  Laos_Schools_Student_Numbers_School_Level_Group: 'School Level',
  Laos_Schools_Student_Numbers_District_Level_Group: 'District Level',
  Laos_Schools_Student_Numbers_Provincial_Level_Group: 'Provincial Level',
};

const FRONTEND_AGGREGATION_LEVEL_TO_BACKEND = {
  District: 'district',
  SubDistrict: 'sub_district',
};

const BASE_MEASURE_BUILDER_CONFIG = {
  dataSourceType: 'custom',
  // dataElementCodes: DYNAMIC,
  entityAggregation: {
    dataSourceEntityType: 'school',
    aggregationType: 'SUM_PER_ORG_GROUP',
    // First get the most recent value per school, then sum to the required level.
    entityAggregationOrder: 'AFTER',
    // aggregationEntityType: DYNAMIC,
  },
};

const PRESENTATION_OPTIONS = {
  displayType: 'shaded-spectrum',
  scaleType: 'neutral',
  valueType: 'number',
  hideByDefault: {
    null: true,
  },
  // measureLevel: DYNAMIC,
};

const BASE_OVERLAY = {
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  isDataRegional: true,
  measureBuilder: 'sumLatestPerOrgUnit',
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_schools"}',
};

const insertOverlay = async (db, overlay, index, parentId) => {
  const { id, name, dataElementCodes, aggregationLevel } = overlay;
  const newOverlay = {
    ...BASE_OVERLAY,
    id,
    name,
    measureBuilderConfig: {
      ...BASE_MEASURE_BUILDER_CONFIG,
      dataElementCodes,
      entityAggregation: {
        ...BASE_MEASURE_BUILDER_CONFIG.entityAggregation,
        aggregationEntityType: FRONTEND_AGGREGATION_LEVEL_TO_BACKEND[aggregationLevel],
      },
    },
    presentationOptions: {
      ...PRESENTATION_OPTIONS,
      measureLevel: aggregationLevel,
    },
    sortOrder: index,
  };
  await insertObject(db, 'mapOverlay', newOverlay);
  await insertOverlayRelation(db, id, parentId, 'mapOverlay');
};

const afterUp = async db => {
  const oldStudentNumbersOverlayGroupId = (
    await db.runSql(`select id from map_overlay_group where code = 'Student_Numbers';`)
  ).rows[0].id;

  const newStudentNumbersOverlayGroupId = (
    await db.runSql(
      `select id from map_overlay_group where code = 'Laos_Schools_Student_Numbers_School_Level_Group';`,
    )
  ).rows[0].id;

  await db.runSql(`
    update map_overlay_group_relation
    set map_overlay_group_id = '${newStudentNumbersOverlayGroupId}'
    where map_overlay_group_id = '${oldStudentNumbersOverlayGroupId}';

    delete from map_overlay_group
    where id = '${oldStudentNumbersOverlayGroupId}';
  `);
};

const beforeDown = async db => {
  const oldStudentNumbersOverlayGroup = {
    id: generateId(),
    name: 'Student Numbers',
    code: 'Student_Numbers',
  };
  insertObject(db, 'map_overlay_group', oldStudentNumbersOverlayGroup);

  const oldStudentNumbersOverlayGroupId = (
    await db.runSql(`select id from map_overlay_group where code = 'Student_Numbers';`)
  ).rows[0].id;

  const newStudentNumbersOverlayGroupId = (
    await db.runSql(
      `select id from map_overlay_group where code = 'Laos_Schools_Student_Numbers_School_Level_Group';`,
    )
  ).rows[0].id;

  await db.runSql(`
    update map_overlay_group_relation
    set map_overlay_group_id = '${oldStudentNumbersOverlayGroupId}'
    where map_overlay_group_id = '${newStudentNumbersOverlayGroupId}';
  `);
};

/**
 * Shouldn't have to touch code below here
 * IF all the groups and overlays that are being added are new
 * ---------------------------------------
 */

const insertOverlayRelation = (db, childId, parentId, childType) => {
  const relationId = generateId();
  return insertObject(db, 'map_overlay_group_relation', {
    id: relationId,
    map_overlay_group_id: parentId,
    child_id: childId,
    child_type: childType,
  });
};

const insertOverlayGroup = async (db, group, parentId) => {
  const existingGroups = (await db.runSql(`select * from "map_overlay_group"`)).rows;
  if (existingGroups.some(({ code }) => code === group.code)) {
    // Because the down migration doesn't handle it, this function shouldn't
    throw new Error('Duplicate overlay group code!');
  }

  const groupId = generateId();
  await insertObject(db, 'map_overlay_group', { ...group, id: groupId });

  if (parentId) await insertOverlayRelation(db, groupId, parentId, 'mapOverlayGroup');

  return groupId;
};

const insertGroupAndChildren = async (db, groupCode, children, parentId = null) => {
  const group = {
    code: groupCode,
    name: GROUP_CODE_TO_NAME[groupCode],
  };
  const groupId = await insertOverlayGroup(db, group, parentId);

  if (Array.isArray(children)) {
    // Children are map overlays. Base case
    return Promise.all(
      children.map((overlay, index) => insertOverlay(db, overlay, index, groupId)),
    );
  }
  // Children are map overlay groups. Recurse.
  return Promise.all(
    Object.entries(children).map(([newGroup, newChildren]) =>
      insertGroupAndChildren(db, newGroup, newChildren, groupId),
    ),
  );
};

exports.up = async function (db) {
  await Promise.all(
    Object.entries(OVERLAYS_IN_HIERARCHY).map(([groupCode, children]) =>
      insertGroupAndChildren(db, groupCode, children),
    ),
  );
  await afterUp(db);
};

const deleteGroupAndChildren = async (db, groupCode, children) => {
  const groupResponse = await db.runSql(
    `select id from "map_overlay_group" where code='${groupCode}';`,
  );
  const groupId = groupResponse.rows[0].id;
  await db.runSql(
    `delete from "map_overlay_group_relation" where map_overlay_group_id='${groupId}';`,
  );
  await db.runSql(`delete from "map_overlay_group_relation" where child_id='${groupId}';`);

  // The group needs to be deleted after the relation to avoid foreign key constraint violations
  await db.runSql(`delete from "map_overlay_group" where code='${groupCode}';`);

  if (Array.isArray(children)) {
    // Children are map overlays. Base case
    return Promise.all(
      children.map(overlay => db.runSql(`delete from "mapOverlay" where id='${overlay.id}'`)),
    );
  }

  // Children are map overlay groups. Recurse.
  return Promise.all(
    Object.entries(children).map(([newGroup, newChildren]) =>
      deleteGroupAndChildren(db, newGroup, newChildren),
    ),
  );
};

exports.down = async function (db) {
  await beforeDown(db);
  await Promise.all(
    Object.entries(OVERLAYS_IN_HIERARCHY).map(([groupCode, children]) =>
      deleteGroupAndChildren(db, groupCode, children),
    ),
  );
};

exports._meta = {
  version: 1,
};
