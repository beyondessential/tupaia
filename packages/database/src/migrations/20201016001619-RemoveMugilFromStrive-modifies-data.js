'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

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

const getHierarchyId = async (db) => {
  const results = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = 'strive';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Strive hierarchy not found`);
}

const getEntityIdByCode = async (db, code) => {
  const results = await db.runSql(`SELECT id FROM entity WHERE code = '${code}';`);
  if (results.rows.length > 0) {
    return results.rows[0].id;
  }
  throw new Error(`Entity with code ${code} Not found`);
}

const ENTITY_AGGREGATION_CONFIG = {
  dataSourceEntityType: 'facility'
};

const getEntityIdsByParentId = async (db, parentId) => {
  const results = await db.runSql(`SELECT id FROM entity WHERE parent_id = '${parentId}';`);
  return results.rows.map(row => row.id);
}

exports.up = async function(db) {
  const hierarchyId = await getHierarchyId(db);

  // 1. Create alternative project hierarchy without Mugil
  const entityIds = {
    PG: await getEntityIdByCode(db, 'PG'),             // country
    Madang: await getEntityIdByCode(db, 'PG_Madang'),  // district
    Mugil: await getEntityIdByCode(db, 'PG_Mugil'),    // facility
    Sausi: await getEntityIdByCode(db, 'PG_MADANG01'), // facility
  };

  // 1.1. inserts all districts
  const districtIds = await getEntityIdsByParentId(db, entityIds.PG);

  for (const districtId of districtIds) {
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: entityIds.PG,
      child_id: districtId,
      entity_hierarchy_id: hierarchyId
    });
  }

  // 1.2. generate list of facilities to insert
  let facilityIdsToInsert = [];
  for (const districtId of districtIds) {
    if (districtId === entityIds.Mugil) {
      continue;
    }
    const facilityIds = await getEntityIdsByParentId(db, districtId);
    facilityIdsToInsert = [...facilityIdsToInsert, ...facilityIds];
  }
  facilityIdsToInsert.push(entityIds.Sausi);

  // 1.3. insert facilities
  await db.runSql(`
    INSERT INTO entity_relation 
    SELECT
      generate_object_id() as id, 
      entity.id as child_id, 
      entity.parent_id as parent_id, 
      '${hierarchyId}' as entity_hierarchy_id 
    FROM entity 
    WHERE id IN (${arrayToDbString(facilityIdsToInsert)});
  `);

  // 1.3. insert villages for each facility inserted
  await db.runSql(`
    INSERT INTO entity_relation 
    SELECT
      generate_object_id() as id, 
      entity.id as child_id, 
      entity.parent_id as parent_id, 
      '${hierarchyId}' as entity_hierarchy_id 
    FROM entity 
    WHERE type = 'village' AND parent_id IN (${arrayToDbString(facilityIdsToInsert)});
  `);

  // 2. Add entity filters to dashboard reports
  const dashboardsResult = await db.runSql(`SELECT id, "dataBuilderConfig" FROM "dashboardReport" WHERE id LIKE 'PG_Strive_PNG_%';`);
  for (const dashboardRow of dashboardsResult.rows) {
    const {dataBuilderConfig} = dashboardRow;

    if (dataBuilderConfig.dataBuilders) {
      // composed config, need to update nested configs
      for (const nestedConfigKey of Object.keys(dataBuilderConfig.dataBuilders)) {
        dataBuilderConfig.dataBuilders[nestedConfigKey].dataBuilderConfig.entityAggregation = ENTITY_AGGREGATION_CONFIG;
      }
    } else {
      // simple case
      dataBuilderConfig.entityAggregation = ENTITY_AGGREGATION_CONFIG;
    }

    await db.runSql(`UPDATE "dashboardReport" SET "dataBuilderConfig" = '${JSON.stringify(dataBuilderConfig)}' WHERE id = '${dashboardRow.id}';`)
  }

  // 3. Add entity filters to map overlays
  // FIXME: dont overwrite where already configured
  const mapOverlaysResult = await db.runSql(`SELECT id, "measureBuilderConfig" FROM "mapOverlay" WHERE id LIKE 'STRIVE_%';`);
  for (const mapOverlayRow of mapOverlaysResult.rows) {
    const {measureBuilderConfig} = mapOverlayRow;

    if (measureBuilderConfig.measureBuilders) {
      // composed config, need to update nested configs
      for (const nestedConfigKey of Object.keys(measureBuilderConfig.measureBuilders)) {
        measureBuilderConfig.measureBuilders[nestedConfigKey].measureBuilderConfig.entityAggregation = ENTITY_AGGREGATION_CONFIG;
      }
    } else {
      // simple case
      measureBuilderConfig.entityAggregation = ENTITY_AGGREGATION_CONFIG;
    }

    await db.runSql(`UPDATE "mapOverlay" SET "measureBuilderConfig" = '${JSON.stringify(measureBuilderConfig)}' WHERE id = '${mapOverlayRow.id}';`)
  }

  return null;
};

exports.down = async function(db) {
  const hierarchyId = await getHierarchyId(db);

  // 1. Undo Create alternative project hierarchy without Mugil (delete all hierarchy rows except project > country)
  const entityIdPG = await getEntityIdByCode(db, 'PG');
  await db.runSql(`DELETE FROM entity_relation WHERE entity_hierarchy_id = '${hierarchyId}' AND child_id <> '${entityIdPG}'`)

  return null;
};

exports._meta = {
  "version": 1
};
