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

const dataSourceId = generateId();
const malariaMapOverlayGroupId = generateId();
const mapOverlayGroupRelationId = generateId();

const dataSource = {
  id: dataSourceId,
  code: 'Total_Positive_Malaria_Cases',
  type: 'dataElement',
  service_type: 'dhis',
  config: { dhisId: 'WgzuSlOetQV', isDataRegional: false, dhisDataType: 'ProgramIndicator' },
};
const malariaMapOverlayGroup = {
  id: malariaMapOverlayGroupId,
  name: 'Malaria',
  code: 'LAOS_EOC_Malaria',
};
const malariaCaseMayOverlay = {
  id: 'LAOS_EOC_Total_Malaria_Cases_By_Sub_District',
  name: 'Malaria Cases by Sub District',
  userGroup: 'Laos EOC User',
  dataElementCode: 'Total_Positive_Malaria_Cases',
  isDataRegional: false,
  measureBuilderConfig: {
    aggregationType: 'SUM',
    entityAggregation: {
      dataSourceEntityType: 'facility',
      aggregationEntityType: 'sub_district',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    values: [
      { color: 'blue', value: 'other' },
      { color: 'grey', value: null },
    ],
    scaleType: 'performanceDesc',
    displayType: 'shaded-spectrum',
    scaleBounds: { left: { max: 0 } },
    measureLevel: 'SubDistrict',
    datePickerLimits: {
      end: {
        unit: 'day',
        offset: 15,
      },
      start: {
        unit: 'day',
        offset: 0,
      },
    },
    defaultTimePeriod: {
      unit: 'day',
      offset: 0,
    },
    periodGranularity: 'one_day_at_a_time',
  },
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_eoc"}',
};
const mapOverlayGroupRelation = {
  id: mapOverlayGroupRelationId,
  map_overlay_group_id: malariaMapOverlayGroupId,
  child_id: malariaCaseMayOverlay.id,
  child_type: 'mapOverlay',
};
// Root
const mapOverlayGroupToRootRelation = {
  id: generateId(),
  map_overlay_group_id: '5f88d3a361f76a2d3f000004',
  child_id: malariaMapOverlayGroupId,
  child_type: 'mapOverlayGroup',
};

exports.up = async function (db) {
  await insertObject(db, 'data_source', dataSource);
  await insertObject(db, 'map_overlay_group', malariaMapOverlayGroup);
  await insertObject(db, 'mapOverlay', malariaCaseMayOverlay);
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation);
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupToRootRelation);
};

const deleteObject = async (db, table, condition) => {
  const [key, value] = Object.entries(condition)[0];
  return db.runSql(`
    DELETE FROM "${table}"
    WHERE ${key} = '${value}'
`);
};
exports.down = async function (db) {
  await deleteObject(db, 'map_overlay_group_relation', {
    child_id: mapOverlayGroupRelation.child_id,
  });
  await deleteObject(db, 'map_overlay_group_relation', {
    child_id: mapOverlayGroupToRootRelation.child_id,
  });
  await deleteObject(db, 'map_overlay_group', { code: malariaMapOverlayGroup.code });
  await deleteObject(db, 'mapOverlay', { id: malariaCaseMayOverlay.id });
  await deleteObject(db, 'data_source', { code: dataSource.code });
};

exports._meta = {
  version: 1,
};
