'use strict';

import { arrayToDbString } from '../utilities';

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

const getHierarchyId = async db => {
  const results = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = 'strive';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Strive hierarchy not found`);
};

const getEntityIdByCode = async (db, code) => {
  const results = await db.runSql(`SELECT id FROM entity WHERE code = '${code}';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Entity with code ${code} Not found`);
};

const getEntityIdsByParentId = async (db, parentId, type) => {
  const results = await db.runSql(
    `SELECT id FROM entity WHERE parent_id = '${parentId}' AND type = '${type}';`,
  );
  return results.rows.map(row => row.id);
};

exports.up = async function (db) {
  const hierarchyId = await getHierarchyId(db);

  // 1. Create alternative project hierarchy without Mugil
  const entityIds = {
    PG: await getEntityIdByCode(db, 'PG'), // country
    Mugil: await getEntityIdByCode(db, 'PG_Mugil'), // facility
  };

  // 1.1. generate list of facilities to insert
  const districtIds = await getEntityIdsByParentId(db, entityIds.PG, 'district');

  const facilityIdsToInsert = [];
  for (const districtId of districtIds) {
    const facilityIds = await getEntityIdsByParentId(db, districtId, 'facility');
    for (const facilityId of facilityIds) {
      if (facilityId === entityIds.Mugil) {
        continue;
      }
      facilityIdsToInsert.push(facilityId);
    }
  }

  // 1.2. insert facilities
  await db.runSql(`
    INSERT INTO entity_relation (id, child_id, parent_id, entity_hierarchy_id)
    SELECT
      generate_object_id() as id,
      entity.id as child_id,
      entity.parent_id as parent_id,
      '${hierarchyId}' as entity_hierarchy_id
    FROM entity
    WHERE id IN (${arrayToDbString(facilityIdsToInsert)});
  `);

  // 2. Add entity filters to dashboard reports
  const updateConfig = config => {
    if (!config.entityAggregation) {
      // eslint-disable-next-line no-param-reassign
      config.entityAggregation = {};
    }
    // don't override if already set
    if (!config.entityAggregation.dataSourceEntityType) {
      // eslint-disable-next-line no-param-reassign
      config.entityAggregation.dataSourceEntityType = 'facility';
    }
  };

  const dashboardsResult = await db.runSql(
    `SELECT id, "dataBuilderConfig" FROM "dashboardReport" WHERE id LIKE 'PG_Strive_PNG_%';`,
  );
  for (const dashboardRow of dashboardsResult.rows) {
    const { dataBuilderConfig } = dashboardRow;

    if (dataBuilderConfig.dataBuilders) {
      // composed config, need to update nested configs
      for (const nestedConfigKey of Object.keys(dataBuilderConfig.dataBuilders)) {
        updateConfig(dataBuilderConfig.dataBuilders[nestedConfigKey].dataBuilderConfig);
      }
    } else {
      // simple case
      updateConfig(dataBuilderConfig);
    }

    await db.runSql(
      `UPDATE "dashboardReport" SET "dataBuilderConfig" = '${JSON.stringify(
        dataBuilderConfig,
      )}' WHERE id = '${dashboardRow.id}';`,
    );
  }

  // 3. Add entity filters to map overlays
  const mapOverlaysResult = await db.runSql(
    `SELECT id, "measureBuilderConfig" FROM "mapOverlay" WHERE id LIKE 'STRIVE_%';`,
  );
  for (const mapOverlayRow of mapOverlaysResult.rows) {
    const { measureBuilderConfig } = mapOverlayRow;

    if (measureBuilderConfig.measureBuilders) {
      // composed config, need to update nested configs
      for (const nestedConfigKey of Object.keys(measureBuilderConfig.measureBuilders)) {
        updateConfig(measureBuilderConfig.measureBuilders[nestedConfigKey].measureBuilderConfig);
      }
    } else {
      // simple case
      updateConfig(measureBuilderConfig);
    }

    await db.runSql(
      `UPDATE "mapOverlay" SET "measureBuilderConfig" = '${JSON.stringify(
        measureBuilderConfig,
      )}' WHERE id = '${mapOverlayRow.id}';`,
    );
  }

  return null;
};

exports.down = async function (db) {
  const hierarchyId = await getHierarchyId(db);

  // 1. Undo Create alternative project hierarchy without Mugil
  // Restore entity_relation to previous state: strive > PG and PG > district relations
  const entityIdPG = await getEntityIdByCode(db, 'PG');
  const entityIdStrive = await getEntityIdByCode(db, 'strive');
  await db.runSql(`
    DELETE FROM entity_relation
    WHERE entity_hierarchy_id = '${hierarchyId}'
    AND parent_id <> '${entityIdStrive}'
    AND parent_id <> '${entityIdPG}'
  `);
  return null;
};

exports._meta = {
  version: 1,
};
