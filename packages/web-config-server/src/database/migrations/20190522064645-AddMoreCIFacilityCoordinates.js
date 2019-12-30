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
      coordinates: [-5.25139, 6.81216],
      organisationUnitCode: 'CI_BELIER09',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'ASAPSU de Yamoussoukro (CMS Prive-Ong)',
    },
    {
      coordinates: [-5.24777, 6.80679],
      organisationUnitCode: 'CI_BELIER10',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'RSB de Yamoussoukro (CMS Prive-Ong)',
    },
    {
      coordinates: [-5.20169, 6.88596],
      organisationUnitCode: 'CI_BELIER14',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: "Allangoua N'Gbessou (CSR-D Public)",
    },
    {
      coordinates: [-5.29206, 6.61743],
      organisationUnitCode: 'CI_BELIER17',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Kroukroubo (CSR-D Public)',
    },
    {
      coordinates: [-5.26927, 6.81059],
      organisationUnitCode: 'CI_BELIER30',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Yamoussoukro (CSU-D Prive Aibef)',
    },
    {
      coordinates: [-5.48535, 6.91224],
      organisationUnitCode: 'CI_BELIER36',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Zatta (CSU-DM Public)',
    },
    {
      coordinates: [-5.27751, 6.79269],
      organisationUnitCode: 'CI_BELIER38',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Yamoussoukro (CSUS-CAT Public)',
    },
    {
      coordinates: [-5.29057, 6.81384],
      organisationUnitCode: 'CI_BELIER42',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Saint Joseph Moscati (Hôpital Catholique)',
    },
    {
      coordinates: [-5.28139, 6.76726],
      organisationUnitCode: 'CI_BELIER43',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Saint Vincent de Paul de Yamoussoukro (Hôpital Psychiatrique)',
    },
    {
      coordinates: [-5.27967, 6.86277],
      organisationUnitCode: 'CI_BELIER44',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Cafop de Yamoussoukro (INF-LC Public)',
    },
    {
      coordinates: [-5.26965, 6.83047],
      organisationUnitCode: 'CI_BELIER46',
      parent_code: 'CI_Belier_Yamoussoukro',
      name: 'Lycée Mami Adjoua de Yamoussoukro (INF-LC Public)',
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
