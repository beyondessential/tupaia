'use strict';

import { codeToId, insertObject } from '../utilities/migration';
import { generateId } from '../utilities';

import palauGeoData from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau.json';
import palauIslandGroupsGeoData from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau_Island_Groups.json';
import palauFacilities from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau_facilities.json';
import palauStatesGeoData from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau_States.json';
import palauVillages from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau_villages.json';

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

const countryCode = 'PW';

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

  if (entity.point) await updatePoint(db, entity);

  if (entity.region) await updateRegion(db, entity);
};

const updatePoint = (db, entity) => {
  return db.runSql(`
    update entity 
    set point = ST_Force2D(ST_GeomFromGeoJSON('${entity.point}')),
    bounds = ST_Expand(ST_Envelope(ST_GeomFromGeoJSON('${entity.point}')::geometry), 1)
    where id = '${entity.id}';
  `);
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
  // Palau already exists, update geoData
  const countryRegion = JSON.stringify(palauGeoData.features[0].geometry);
  await db.runSql(`
    update entity 
    set region = ST_GeomFromGeoJSON('${countryRegion}'),
    bounds = ST_Envelope(ST_GeomFromGeoJSON('${countryRegion}')::geometry)
    where code = '${countryCode}'
  `);

  const palauIslandGroups = extractEntitiesFromGeoData(palauIslandGroupsGeoData);
  const mappedPalauIslandGroups = await Promise.all(
    palauIslandGroups.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      return {
        ...entity,
        id: generateId(),
        parent_id: parentId,
        region: entity.geometry ? JSON.stringify(entity.geometry) : null,
      };
    }),
  );
  await Promise.all(mappedPalauIslandGroups.map(entity => insertEntity(db, entity)));

  const mappedPalauFacilities = await Promise.all(
    palauFacilities.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      const point = entity.Latitude
        ? { type: 'Point', coordinates: [entity.Longitude, entity.Latitude] }
        : null;
      return {
        id: generateId(),
        parent_id: parentId,
        code: entity.code,
        name: entity.name,
        type: 'facility',
        point: point ? JSON.stringify(point) : null,
        country_code: countryCode,
      };
    }),
  );
  await Promise.all(mappedPalauFacilities.map(entity => insertEntity(db, entity)));

  const palauStates = extractEntitiesFromGeoData(palauStatesGeoData);
  const mappedPalauStates = await Promise.all(
    palauStates.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      return {
        ...entity,
        id: generateId(),
        parent_id: parentId,
        region: entity.geometry ? JSON.stringify(entity.geometry) : null,
      };
    }),
  );
  await Promise.all(
    mappedPalauStates.map(async entity => {
      return insertEntity(db, entity);
    }),
  );

  const mappedPalauVillages = await Promise.all(
    palauVillages.map(async entity => {
      const parentCode = entity[0];
      const parentId = await codeToId(db, 'entity', parentCode);
      return {
        id: generateId(),
        parent_id: parentId,
        code: entity[1],
        name: entity[2],
        type: 'village',
        country_code: countryCode,
      };
    }),
  );
  await Promise.all(mappedPalauVillages.map(entity => insertEntity(db, entity)));

  return null;
};

exports.down = function (db) {
  return db.runSql(`
    delete from entity where type = 'village' and country_code = 'PW';
    delete from entity where type = 'sub_district' and country_code = 'PW';
    delete from entity where type = 'facility' and country_code = 'PW';
    delete from entity where type = 'district' and country_code = 'PW';
  `);
};

exports._meta = {
  version: 1,
};
