'use strict';

import { codeToId, generateId, insertObject } from '../utilities';
import samoaSubDistrictGeoData from './migrationData/20210803014704-CovidSamoaAddSubDistrictEntities/Samoa_SubDistrict_Entities_GeoJSON_V2.json';

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

const countryCode = 'WS';

const extractEntitiesFromGeoData = geoData =>
  geoData.features.map(feature => ({
    code: feature.properties.code,
    parent_code: feature.properties.parent_code,
    name: feature.properties.name,
    type: feature.properties.entity_type,
    country_code: countryCode,
    geometry: feature.geometry,
  }));

const insertEntity = async (db, entity) => {
  await insertObject(db, 'entity', {
    id: entity.id,
    code: entity.code,
    parent_id: entity.parent_id,
    name: entity.name,
    type: entity.type,
    country_code: entity.country_code,
  });

  if (entity.region) await updateRegion(db, entity);
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

/*
  This migration is 3 parts with 
  20210803033646-CovidSamoaSubDistrictRelations-modifies-data as part 2
  20210803035205-CovidSamoaAddVillageEntityRelations-modifies-data as part 3

  In this one we are importing the sub_districts via a migration because:
  a. Avoids timing issues with importing and setting hierarchy relations
  b. Solves issue of Unknown Island having no geodata which breaks admin import
*/
exports.up = async function (db) {
  const samoaSubDistricts = extractEntitiesFromGeoData(samoaSubDistrictGeoData);
  const mappedSamoaSubDistricts = await Promise.all(
    samoaSubDistricts.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      return {
        ...entity,
        id: generateId(),
        parent_id: parentId,
        region: entity.geometry ? JSON.stringify(entity.geometry) : null,
      };
    }),
  );
  await Promise.all(mappedSamoaSubDistricts.map(entity => insertEntity(db, entity)));

  return null;
};

exports.down = function (db) {
  return db.runSql(`
    delete from entity where type = 'sub_district' and country_code = '${countryCode}';
  `);
};

exports._meta = {
  version: 1,
};
