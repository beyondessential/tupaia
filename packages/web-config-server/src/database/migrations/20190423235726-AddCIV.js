'use strict';

import { existsSync, readFileSync } from 'fs';
import { insertObject } from '../migrationUtilities';

function loadDataRaw(baseDir, filename) {
  const filePath = `${baseDir}/${filename}`;
  if (!existsSync(filePath)) {
    console.warn('No file', filePath);
    return null;
  }

  const raw = readFileSync(filePath);
  return raw + ''; // convert buffer to string
}

function loadData(baseDir, filename) {
  const raw = loadDataRaw(baseDir, filename);
  if (!raw) {
    console.warn('File is empty:', filename);
    return null;
  }

  const data = JSON.parse(raw);
  return data;
}

function addPolygonToRegion(db, baseDir, code) {
  const data = loadDataRaw(baseDir, code + '.geojson');

  if (!data) {
    console.warn('No GeoJSON data for', code);
    return;
  }

  console.log('Adding geo to', code);
  return db.runSql(`
    UPDATE "entity"
    SET region = ST_GeomFromGeoJSON('${data}')
    WHERE code = '${code}';
  `);
}

async function addRegion(db, data, baseDir) {
  const { name, code, type, parent_code, country_code } = data;

  console.log('Adding region', code);

  // add entity object
  await insertObject(db, 'entity', {
    name,
    code,
    type,
    parent_code,
    country_code,
    id: code,
  });

  // load & add geojson
  await addPolygonToRegion(db, baseDir, code);
}

async function addFacility(db, data) {
  const {
    coordinates,
    organisationUnitCode,
    photoUrl,
    parent_code,
    country_code,
    orgUnitLevel,
    facilityTypeCode,
    name,
  } = data;

  console.log('Adding facility', organisationUnitCode);

  // add entity object
  await insertObject(db, 'entity', {
    name,
    code: organisationUnitCode,
    id: organisationUnitCode,
    type: 'facility',
    parent_code,
    country_code,
  });

  // add coordinates
  const point = JSON.stringify({ coordinates, type: 'Point' });
  await db.runSql(`
    UPDATE "entity"
    SET point = ST_GeomFromGeoJSON('${point}')
    WHERE code = '${organisationUnitCode}';
  `);

  // add clinic object
  // -- not needed in this migration, they're already entered
}

async function importCountryData(db, countryCode, baseDir) {
  // add regions
  console.log('Adding regions');
  const regionImportTasks = loadData(baseDir, 'regions.json')
    .map(r => ({ ...r, country_code: countryCode }))
    .map(r => addRegion(db, r, baseDir));
  await Promise.all(regionImportTasks);

  // calculate bounds for all regions
  console.log('Adding bounds');
  await db.runSql(`
    UPDATE "entity" 
      SET "bounds" = ST_Envelope("region"::geometry) 
      WHERE "country_code" = '${countryCode}';
  `);

  // add facilities
  console.log('Adding facilities');
  const facilityImportTasks = loadData(baseDir, 'facilities.json')
    .map(f => ({ ...f, country_code: countryCode }))
    .map(f => addFacility(db, f));
  await Promise.all(facilityImportTasks);
}

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

exports.up = function(db) {
  return importCountryData(db, 'CI', 'src/database/migrationData/20190423235726-AddCIV');
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM "entity" WHERE "country_code" = 'CI';
  `);
};

exports._meta = {
  version: 1,
};
