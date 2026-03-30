'use strict';

import { arrayToDbString, codeToId, generateId, insertObject } from '../utilities';
import subDivisionsGeoData from './migrationData/20210603034000-AddFijiCovid19SubDivisions-modifies-data/Fiji_SubDivisions 20210609.json';

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

const countryCode = 'FJ';
const hierarchyName = 'supplychain_fiji';

const extractEntitiesFromGeoData = geoData =>
  geoData.features.map(feature => ({
    code: feature.properties.code,
    parent_code: feature.properties.parent_code,
    name: feature.properties.name,
    type: feature.properties.entity_type,
    country_code: countryCode,
    geometry: feature.geometry,
  }));

const insertEntity = async (db, entity, hierarchyId) => {
  await insertObject(db, 'entity', {
    id: entity.id,
    code: entity.code,
    parent_id: entity.parent_id,
    name: entity.name,
    type: entity.type,
    country_code: entity.country_code,
  });

  if (entity.region) await updateRegion(db, entity);

  return insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: entity.parent_id,
    child_id: entity.id,
    entity_hierarchy_id: hierarchyId,
  });
};

const updateRegion = (db, entity) => {
  const regionFunction =
    entity.region.type === 'MultiPolygon'
      ? `ST_GeomFromGeoJSON('${entity.region}')`
      : `ST_Multi(ST_GeomFromGeoJSON('${entity.region}'))`;

  return db.runSql(`
    update entity 
    set region = ${regionFunction},
    bounds = ST_Envelope(ST_GeomFromGeoJSON('${entity.region}')::geometry)
    where id = '${entity.id}';
  `);
};

exports.up = async function (db) {
  console.log('subDivisionsGeoData', subDivisionsGeoData);
  const hierarchyId = (
    await db.runSql(`
    select id from "entity_hierarchy" where "name" = '${hierarchyName}';
  `)
  ).rows[0].id;
  console.log('hierarchyId: ', hierarchyId);
  const subDivisions = extractEntitiesFromGeoData(subDivisionsGeoData);
  console.log('subDivisions: ', subDivisions);
  const mappedSubDivisions = await Promise.all(
    subDivisions.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      return {
        ...entity,
        id: generateId(),
        parent_id: parentId,
        region: entity.geometry ? JSON.stringify(entity.geometry) : null,
      };
    }),
  );
  console.log('mappedSubDivisions: ', mappedSubDivisions);
  const results = await Promise.all(
    mappedSubDivisions.map(async entity => {
      return insertEntity(db, entity, hierarchyId);
    }),
  );
  console.log('results: ', results);

  return results;
};

exports.down = function (db) {
  const subDivisions = extractEntitiesFromGeoData(subDivisionsGeoData);
  const subDivisionCodes = subDivisions.map(sd => sd.code);
  return db.runSql(`
    delete from "entity_relation" 
      where child_id in (
          select id from entity where code in (${arrayToDbString(subDivisionCodes)})
          );
    delete from entity where code in (${arrayToDbString(subDivisionCodes)});
  `);
};

exports._meta = {
  version: 1,
};
