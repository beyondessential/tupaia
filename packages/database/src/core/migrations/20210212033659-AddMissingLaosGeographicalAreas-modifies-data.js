'use strict';

import { generateId, insertObject } from '../utilities';

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

// Modified copy from packages/central-server/src/routes/importEntities/getOrCreateParentEntity.js
const getGeographicalAreaCode = (name, countryCode) => {
  return `${countryCode}_${name.replace("'", '')}`;
};

const getLaosCountryId = async db => {
  const country = await db.runSql(`SELECT id FROM country WHERE code = 'LA'`);
  return country.rows[0].id;
};

exports.up = async function (db) {
  const laosCountryId = await getLaosCountryId(db);

  // 1. country
  const countryGaResult = await db.runSql(`SELECT * FROM geographical_area WHERE code = 'LA'`);
  if (countryGaResult.rows.length === 0) {
    await insertObject(db, 'geographical_area', {
      id: generateId(),
      name: 'Laos',
      country_id: laosCountryId,
      code: 'LA',
      level_code: 'country',
      level_name: 'Country',
    });
  }

  // 2. fix district with bad name
  await db.runSql(`
    UPDATE geographical_area SET name = 'Xaignabouly', code = 'LA_Xaignabouly' 
    WHERE level_code = 'district' and name = 'Xayabury';
  `);

  // 2. add all sub districts
  const districtGaMap = await db.runSql(`
    SELECT entity.id, ga.id as "geographical_area_id" FROM entity
    LEFT JOIN geographical_area ga on entity.name = ga.name
    WHERE entity.code like 'LA%'
    AND entity.type = 'district';
  `);

  const subDistricts = await db.runSql(`
    SELECT * FROM entity 
    WHERE entity.code like 'LA%' 
    AND entity.type = 'sub_district';
  `);

  for (const subDistrict of subDistricts.rows) {
    const parentGaId = districtGaMap.rows.find(mapItem => mapItem.id === subDistrict.parent_id)
      .geographical_area_id;

    if (!parentGaId) {
      throw new Error('Failed to find parent entity geographical_area');
    }

    await insertObject(db, 'geographical_area', {
      id: generateId(),
      name: subDistrict.name,
      code: getGeographicalAreaCode(subDistrict.name, 'LA'),
      country_id: laosCountryId,
      parent_id: parentGaId,
      level_code: 'sub_district',
      level_name: 'Sub District',
    });
  }

  return null;
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM geographical_area WHERE code = 'LA';`);

  await db.runSql(`
    UPDATE geographical_area SET name = 'Xayabury', code = 'LA_Xayabury' 
    WHERE level_code = 'district' and name = 'Xaignabouly';
  `);

  await db.runSql(
    `DELETE FROM geographical_area WHERE code like 'LA%' and level_code = 'sub_district';`,
  );
};

exports._meta = {
  version: 1,
};
