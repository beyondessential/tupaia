'use strict';

import { insertObject } from '../migrationUtilities';

async function addEntityForFacility(db, data) {
  const { coordinates, organisationUnitCode, parent_code, country_code, name } = data;

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

async function importMissingCIFacilityCoordinates(db) {
  const facilityData = [
    {
      coordinates: [-5.27552, 6.80388],
      organisationUnitCode: 'CI_BELIER50',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Prive CSCT de Yamoussoukro (INF-PV)',
    },
  ];

  console.log('Adding facilities');
  const facilityImportTasks = facilityData
    .map(f => ({ ...f, country_code: 'CI' }))
    .map(f => addEntityForFacility(db, f));
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
  return importMissingCIFacilityCoordinates(db);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
