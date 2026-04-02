'use strict';

import { codeToId, insertObject } from '../utilities/migration';
import { generateId } from '../utilities';

import samoaHouseholds from './migrationData/20210803014704-CovidSamoaAddSubDistrictEntities/Entities - households.json';

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

  if (entity.point) await updatePoint(db, entity);
};

const updatePoint = (db, entity) => {
  return db.runSql(`
    update entity 
    set point = ST_Force2D(ST_GeomFromGeoJSON('${entity.point}')),
    bounds = ST_Expand(ST_Envelope(ST_GeomFromGeoJSON('${entity.point}')::geometry), 1)
    where id = '${entity.id}';
  `);
};

exports.up = async function (db) {
  const mappedSamoaHouseholds = await Promise.all(
    samoaHouseholds.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      const point = entity.Latitude
        ? { type: 'Point', coordinates: [entity.Longitude, entity.Latitude] }
        : null;
      return {
        id: generateId(),
        parent_id: parentId,
        code: entity.code,
        name: entity.name,
        type: entity.entity_type,
        point: point ? JSON.stringify(point) : null,
        country_code: countryCode,
      };
    }),
  );
  await Promise.all(mappedSamoaHouseholds.map(entity => insertEntity(db, entity)));

  // update covid_samoa canonical types
  await db.runSql(`
    update entity_hierarchy set canonical_types = '{country,household,case,individual}' where name = 'covid_samoa';
  `);

  return null;
};

exports.down = function (db) {
  return db.runSql(`
    delete from entity where type = 'household' and country_code = 'WS';
    update entity_hierarchy set canonical_types = '{country,case,individual}' where name = 'covid_samoa';
  `);
};

exports._meta = {
  version: 1,
};
