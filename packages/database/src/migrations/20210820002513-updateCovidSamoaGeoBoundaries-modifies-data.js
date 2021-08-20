'use strict';

import samoaSubDistrictGeoData from './migrationData/20210820002513-updateCovidSamoaGeoBoundaries/Samoa_SubDistrict_Entities_GeoJSON_FINAL_wUnkDist.json';

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

const updateRegion = (db, entity) => {
  const regionFunction =
    entity.region.type === 'MultiPolygon'
      ? `ST_GeomFromGeoJSON('${entity.region}')`
      : `ST_Multi(ST_GeomFromGeoJSON('${entity.region}'))`;

  return db.runSql(`
    update entity 
    set region = ${regionFunction},
    bounds = ST_Envelope(ST_GeomFromGeoJSON('${entity.region}')::geometry)
    where code = '${entity.code}';
  `);
};

exports.up = async function (db) {
  const samoaSubDistricts = extractEntitiesFromGeoData(samoaSubDistrictGeoData);
  // console.log('samoaSubDistricts:', samoaSubDistricts);
  const updatedSamoaSubDistricts = await Promise.all(
    samoaSubDistricts.map(entity =>
      entity.geometry
        ? updateRegion(db, { ...entity, region: JSON.stringify(entity.geometry) })
        : null,
    ),
  );
  // console.log('updatedSamoaSubDistricts:', updatedSamoaSubDistricts);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
