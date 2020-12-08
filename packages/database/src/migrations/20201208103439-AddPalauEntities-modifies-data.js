'use strict';

import { codeToId, insertObject } from '../utilities/migration';
import { arrayToDbString, generateId } from '../utilities';

import palauGeoData from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau.json';
import palauIslandGroupsGeoData from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau_Island_Groups.json';
import palauStatesGeoData from './migrationData/20201208103439-AddPalauEntities-modifies-data/Palau_States.json';

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

const insertEntity = async (db, entity) =>
  insertObject(db, 'entity', {
    id: entity.id,
    code: entity.code,
    parent_id: entity.parent_id,
    name: entity.name,
    type: entity.type,
    country_code: entity.country_code,
  });

exports.up = async function (db) {
  // console.log('palauGeoData', palauGeoData);
  // console.log('palauIslandGroupsGeoData', palauIslandGroupsGeoData);

  const palauIslandGroups = extractEntitiesFromGeoData(palauIslandGroupsGeoData);
  // console.log('palauIslandGroups', palauIslandGroups);
  const mappedPalauIslandGroups = await Promise.all(
    palauIslandGroups.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      return {
        ...entity,
        id: generateId(),
        parent_id: parentId,
      };
    }),
  );

  // console.log('mappedPalauIslandGroups', mappedPalauIslandGroups);

  const results = await Promise.all(
    mappedPalauIslandGroups.map(entity => insertEntity(db, entity)),
  );
  console.log('results', results);

  // console.log('palauStatesGeoData', palauStatesGeoData);
  const palauStates = extractEntitiesFromGeoData(palauStatesGeoData);
  // console.log('palauStates', palauStates);

  const mappedPalauStates = await Promise.all(
    palauStates.map(async entity => {
      const parentId = await codeToId(db, 'entity', entity.parent_code);
      return {
        ...entity,
        id: generateId(),
        parent_id: parentId,
      };
    }),
  );

  console.log('mappedPalauStates', mappedPalauStates);

  await Promise.all(
    mappedPalauStates.map(async entity => {
      return insertEntity(db, entity);
    }),
  );

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
