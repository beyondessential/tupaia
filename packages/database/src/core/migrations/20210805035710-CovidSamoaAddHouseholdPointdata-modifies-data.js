'use strict';

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

const updatePoint = (db, entityCode, point) => {
  return db.runSql(`
    update entity 
    set point = ST_Force2D(ST_GeomFromGeoJSON('${JSON.stringify(point)}')),
    bounds = ST_Expand(ST_Envelope(ST_GeomFromGeoJSON('${JSON.stringify(point)}')::geometry), 1)
    where code = '${entityCode}';
  `);
};

exports.up = async function (db) {
  const results = await Promise.all(
    samoaHouseholds.map(async entity => {
      const point = entity.latitude
        ? { type: 'Point', coordinates: [entity.longitude, entity.latitude] }
        : null;
      if (!point) {
        return null;
      }
      return updatePoint(db, entity.code, point);
    }),
  );
  return results;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
