'use strict';

import { insertObject } from '../utilities/migration';
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

const COLOUR_MAP_OVERLAY = {
  id: 'TO_HPU_NCD_Risk_Factory_Screening_Type_Setting_Unique',
  name: 'NCD Risk Factor Screening: Setting Type',
  userGroup: 'Tonga Health Promotion Unit',
  dataElementCode: 'value',
  isDataRegional: false,
  measureBuilder: 'selectUniqueValueFromEventsPerOrgUnit',
  measureBuilderConfig: {
    valueToSelect: 'HP31n',
    dataValues: {
      HP31n: '*',
    },
    programCode: 'HP02',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
  presentationOptions: {
    values: [
      {
        icon: 'circle',
        name: 'Church',
        color: 'darkblue',
        value: 'Church',
      },
      {
        icon: 'circle',
        name: 'School',
        color: 'orange',
        value: 'School',
      },
      {
        icon: 'circle',
        name: 'Workplace',
        color: 'pink',
        value: 'Workplace',
      },
      {
        icon: 'circle',
        name: 'Community',
        color: 'lightblue',
        value: 'Community',
      },
      {
        icon: 'circle',
        name: 'Multiple Settings',
        color: 'yellow',
        value: 'NO_UNIQUE_VALUE',
      },
    ],
    hideFromPopup: true,
    measureLevel: 'Facility',
  },
  countryCodes: '{"TO"}',
  projectCodes: '{"fanafana"}',
};

const TOTAL_MAP_OVERLAY = {
  id: 'TO_HPU_NCD_Risk_Factory_Screening_Type_Setting_Type_ZZZ_Total',
  name: 'Total Screenings',
  userGroup: 'Tonga Health Promotion Unit',
  dataElementCode: 'value',
  isDataRegional: false,
  measureBuilder: 'countEventsPerOrgUnit',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    dataValues: {
      HP31n: '*',
    },
    programCode: 'HP02',
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'village',
      aggregationEntityType: 'facility',
    },
  },
  presentationOptions: {
    values: [
      {
        name: '0',
        value: '0',
        icon: 'circle',
        hideFromPopup: true,
        hideFromLegend: true,
      },
      {
        name: 'No data',
        value: 'null',
        color: 'Grey',
        icon: 'circle',
        hideFromLegend: true,
      },
      {
        value: 'other',
        icon: 'circle',
        hideFromLegend: true,
      },
    ],
    displayType: 'icon',
    measureLevel: 'Facility',
  },
  countryCodes: '{"TO"}',
  projectCodes: '{"fanafana"}',
};

const DATA_VALUES = ['Church', 'School', 'Workplace', 'Community'];

const MAP_OVERLAY_GROUP_ID = generateId();
const MAP_OVERLAY_GROUP = {
  id: MAP_OVERLAY_GROUP_ID,
  name: 'Fanafana Ola HPU',
  code: 'Fanafana_Ola_HPU',
};

const MAP_OVERLAY_GROUP_RELATION = {
  id: generateId(),
  map_overlay_group_id: MAP_OVERLAY_GROUP_ID,
  child_id: COLOUR_MAP_OVERLAY.id,
  child_type: 'mapOverlay',
};

exports.up = async function (db) {
  await insertObject(db, 'mapOverlay', TOTAL_MAP_OVERLAY);
  const overlayIds = [TOTAL_MAP_OVERLAY.id];

  for (const dataValue of DATA_VALUES) {
    TOTAL_MAP_OVERLAY.id = `TO_HPU_NCD_Risk_Factory_Screening_Type_Setting_Type_${dataValue}`;
    TOTAL_MAP_OVERLAY.name = `${dataValue} Screenings`;
    TOTAL_MAP_OVERLAY.measureBuilderConfig.dataValues.HP31n = {
      value: dataValue,
      operator: '=',
    };
    TOTAL_MAP_OVERLAY.presentationOptions.values[1].hideFromPopup = true;
    await insertObject(db, 'mapOverlay', TOTAL_MAP_OVERLAY);
    overlayIds.push(TOTAL_MAP_OVERLAY.id);
  }

  COLOUR_MAP_OVERLAY.linkedMeasures = `{"${overlayIds.join('", "')}"}`;
  await insertObject(db, 'mapOverlay', COLOUR_MAP_OVERLAY);
  await insertObject(db, 'map_overlay_group', MAP_OVERLAY_GROUP);
  await insertObject(db, 'map_overlay_group_relation', MAP_OVERLAY_GROUP_RELATION);
};

exports.down = function (db) {
  return db.runSql(`
      DELETE FROM map_overlay_group_relation
      WHERE child_id = '${COLOUR_MAP_OVERLAY.id}';
      DELETE FROM map_overlay_group
      WHERE code = '${MAP_OVERLAY_GROUP.code}';
      DELETE FROM "mapOverlay"
      WHERE id LIKE '%TO_HPU_NCD_Risk_Factory_Screening_Type_Setting_%';
  `);
};

exports._meta = {
  version: 1,
};
