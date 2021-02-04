'use strict';

import { codeToId, insertObject } from '../utilities';
import { generateId } from '../utilities/generateId';

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

const MAIN_OVERLAY_ID = 'Fiji_Operational_Facilities';

const LINKED_OVERLAY_ID = 'Fiji_Operational_Facility_Type';

const MAIN_OVERLAY = {
  id: MAIN_OVERLAY_ID,
  name: 'Operational facilities',
  userGroup: '',
  dataElementCode: 'BCD1',
  linkedMeasures: `{${LINKED_OVERLAY_ID}}`,
  isDataRegional: true,
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    values: [
      {
        icon: 'circle',
        name: 'Open',
        value: ['Fully Operational', 'Operational but closed this week'],
      },
      {
        icon: 'x',
        name: 'Temporarily closed',
        value: 'Temporarily Closed',
      },
      {
        icon: 'triangle',
        name: 'Permanently closed',
        value: 'Permanently Closed',
      },
      {
        icon: 'empty',
        name: 'No data',
        value: 'null',
      },
    ],
    displayType: 'icon',
    customColors: 'RoyalBlue,RoyalBlue,OrangeRed,OrangeRed',
    measureLevel: 'Facility',
  },
  countryCodes: '{FJ}',
  projectCodes: '{explore}',
};

const LINKED_OVERLAY = {
  id: LINKED_OVERLAY_ID,
  name: 'Facility types',
  dataElementCode: 'facilityTypeCode',
  userGroup: 'Public',
  measureBuilderConfig: {
    facilityTypeCodeMetadataKey: 'type',
  },
  measureBuilder: 'valueForOrgGroup',
  presentationOptions: {
    values: [
      {
        name: 'Divisional hospital',
        color: 'yellow',
        value: '1.1',
      },
      {
        name: 'Sub-divisional hospital',
        color: 'teal',
        value: '1.2',
      },
      {
        name: 'Specialist hospital',
        color: 'green',
        value: '1.3',
      },
      {
        name: 'Health centre',
        color: 'orange',
        value: 2,
      },
      {
        name: 'Nursing station',
        color: 'purple',
        value: 3,
      },
    ],
    displayType: 'color',
    hideFromMenu: true,
    measureLevel: 'Facility',
    displayedValueKey: 'facilityTypeName',
  },
  countryCodes: '{FJ}',
  projectCodes: '{explore}',
};

exports.up = async function (db) {
  const mainMapOverlayRelation = {
    id: generateId(),
    map_overlay_group_id: await codeToId(db, 'map_overlay_group', 'Services_provided'),
    child_id: MAIN_OVERLAY_ID,
    child_type: 'mapOverlay',
    sort_order: 0,
  };

  const linkedMapOverlayRelation = {
    id: generateId(),
    map_overlay_group_id: await codeToId(db, 'map_overlay_group', 'Services_provided'),
    child_id: LINKED_OVERLAY_ID,
    child_type: 'mapOverlay',
    sort_order: 0, // doesn't matter because this overlay is hidden
  };

  await insertObject(db, 'mapOverlay', MAIN_OVERLAY);
  await insertObject(db, 'mapOverlay', LINKED_OVERLAY);

  await insertObject(db, 'map_overlay_group_relation', mainMapOverlayRelation);
  await insertObject(db, 'map_overlay_group_relation', linkedMapOverlayRelation);

  // Remove old Operational Facilities from FJ
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "countryCodes" = ARRAY_REMOVE("countryCodes", 'FJ')
    WHERE id IN ('126', '171');
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "mapOverlay" WHERE "id" = '${MAIN_OVERLAY_ID}';
    DELETE FROM "mapOverlay" WHERE "id" = '${LINKED_OVERLAY_ID}';
  `);

  await db.runSql(`
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${MAIN_OVERLAY_ID}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${LINKED_OVERLAY_ID}';
  `);

  await db.runSql(`
    UPDATE "mapOverlay"
    SET "countryCodes" = ARRAY_APPEND("countryCodes", 'FJ')
    WHERE id IN ('126', '171');
  `);
};

exports._meta = {
  version: 1,
};
