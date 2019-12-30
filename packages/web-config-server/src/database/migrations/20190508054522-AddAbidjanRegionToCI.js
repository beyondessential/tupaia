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
}

async function importAbidjanRegionAndHospital(db) {
  const baseDir = 'src/database/migrationData/20190508054522-AddAbidjan';
  const regionData = {
    name: 'Abidjan',
    code: 'CI_Abidjan',
    type: 'region',
    parent_code: 'CI',
    country_code: 'CI',
  };
  // We're recieving facility coordinates periodically for CI, however they need to be added as we get them.
  // Have added these into the facilities json file that was used for the initial import as well for conisistency
  // but figure it's easier to just add them like this as they come rather than go through the facilities
  // file and figuring out which ones haven't been added yet every time.
  const facilityData = [
    {
      coordinates: [-3.9947, 5.3438],
      organisationUnitCode: 'CI_ABIDJAN01',
      photoUrl: '',
      parent_code: 'CI_Abidjan',
      orgUnitLevel: 'Facility',
      facilityTypeCode: '3',
      name: 'CHU De Cocody',
    },
    {
      coordinates: [-5.26248, 6.82402],
      organisationUnitCode: 'CI_BELIER33',
      photoUrl: '',
      parent_code: 'CI_Belier_Yamoussoukro',
      orgUnitLevel: 'Facility',
      facilityTypeCode: '2',
      name: 'Nzuéssy de YAMOUSSOUKRO (CSU-D PUBLIC)',
    },
    {
      coordinates: [-5.27924, 6.84892],
      organisationUnitCode: 'CI_BELIER45',
      photoUrl: '',
      parent_code: 'CI_Belier_Yamoussoukro',
      orgUnitLevel: 'Facility',
      facilityTypeCode: '2',
      name: 'Lycée BAD de YAMOUSSOUKRO (INF-LC PUBLIC)',
    },
    {
      coordinates: [-5.26662, 6.81552],
      organisationUnitCode: 'CI_BELIER03',
      photoUrl: '',
      parent_code: 'CI_Belier_Yamoussoukro',
      orgUnitLevel: 'Facility',
      facilityTypeCode: '2',
      name: 'Médico Chirurgical Grâce des LACS de YAMOUSSOUKRO (CM PRIVE)',
    },
  ];

  console.log('Adding region: ', regionData.code);
  await addRegion(db, regionData, baseDir);

  console.log('Adding facilities');
  const facilityImportTasks = facilityData
    .map(f => ({ ...f, country_code: regionData.country_code }))
    .map(f => addFacility(db, f));
  await Promise.all(facilityImportTasks);

  // recalc bounds for each point so map knows where to zoom to.
  await db.runSql(`
  UPDATE "entity"
    SET 
      "bounds" = ST_Expand(ST_Envelope("point"::geometry), 1)
    WHERE 
      "bounds" IS NULL
      AND "point" IS NOT NULL;
`);
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
  return importAbidjanRegionAndHospital(db);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
