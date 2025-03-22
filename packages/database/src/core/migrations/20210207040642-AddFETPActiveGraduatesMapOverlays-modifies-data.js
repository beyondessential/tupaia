'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

async function deleteMapOverlay(db, mapOverlayId) {
  return db.runSql(`
    DELETE FROM
      "mapOverlay"
    WHERE
      "id" = '${mapOverlayId}';
  `);
}

async function deleteMapOverlayGroup(db, mapOverlayGroupId) {
  return db.runSql(`
    DELETE FROM
      map_overlay_group
    WHERE
      id = '${mapOverlayGroupId}';
  `);
}

async function deleteRelationByChildId(db, childId) {
  return db.runSql(`
    DELETE FROM
      "map_overlay_group_relation"
    WHERE
      "child_id" = '${childId}';
  `);
}

const ROOT_OVERLAY_GROUP = 'Root';

const OVERLAYS = [
  {
    id: 'FETP_Active_Graduates_By_Province',
    name: 'Active graduates by province',
    dataValues: {
      FETPNG20Data_033: '*',
    },
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'individual',
      aggregationEntityType: 'district',
    },
    measureLevel: 'District',
  },
  {
    id: 'FETP_Active_Graduates_By_District',
    name: 'Active graduates by district',
    dataValues: {
      FETPNG20Data_034: '*',
    },
    entityAggregation: {
      aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
      dataSourceEntityType: 'individual',
      aggregationEntityType: 'sub_district',
    },
    measureLevel: 'SubDistrict',
  },
];

const BASE_MEASURE_BUILDER_CONFIG = {
  programCode: 'FGDS',
  dataSourceType: 'custom',
};

const BASE_PRESENTATION_OPTIONS = {
  scaleType: 'performanceDesc',
  valueType: 'number',
  displayType: 'shaded-spectrum',
  scaleBounds: {
    left: {
      max: 0,
    },
  },
};

const BASE_OVERLAY = {
  userGroup: 'FETP Graduates',
  dataElementCode: 'value',
  measureBuilder: 'countEventsPerOrgUnit',
  countryCodes: '{PG}',
  projectCodes: '{fetp}',
};

const FETP_MAP_OVERLAY_GROUP = {
  id: generateId(),
  name: 'FETP',
  code: 'FETP',
};

exports.up = async function (db) {
  await insertObject(db, 'map_overlay_group', FETP_MAP_OVERLAY_GROUP);
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: await codeToId(db, 'map_overlay_group', ROOT_OVERLAY_GROUP),
    child_id: FETP_MAP_OVERLAY_GROUP.id,
    child_type: 'mapOverlayGroup',
  });

  for (const overlay of OVERLAYS) {
    const { id, name, dataValues, entityAggregation, measureLevel } = overlay;
    await insertObject(db, 'mapOverlay', {
      ...BASE_OVERLAY,
      id,
      name,
      measureBuilderConfig: {
        ...BASE_MEASURE_BUILDER_CONFIG,
        dataValues,
        entityAggregation,
      },
      presentationOptions: {
        ...BASE_PRESENTATION_OPTIONS,
        measureLevel,
      },
    });
    await insertObject(db, 'map_overlay_group_relation', {
      id: generateId(),
      map_overlay_group_id: FETP_MAP_OVERLAY_GROUP.id,
      child_id: overlay.id,
      child_type: 'mapOverlay',
    });
  }
};

exports.down = async function (db) {
  for (const overlay of OVERLAYS) {
    await deleteMapOverlay(db, overlay.id);
    await deleteRelationByChildId(db, overlay.id);
  }

  await deleteMapOverlayGroup(db, FETP_MAP_OVERLAY_GROUP.id);
  await deleteRelationByChildId(db, FETP_MAP_OVERLAY_GROUP.id);
};

exports._meta = {
  version: 1,
};
