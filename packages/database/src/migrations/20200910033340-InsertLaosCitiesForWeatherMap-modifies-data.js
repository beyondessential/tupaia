'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';
import { insertEntity } from '../utilities/migration';
import { EntityModel } from '../modelClasses';

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

/*
 * Most populous cities in Laos
 *
 * Data from: http://www.geonames.org/LA/largest-cities-in-laos.html
 * - code is city name in uppercase (would use UN/LOCODE but not all have them, nor IATA airport codes)
 * - point is that lat/lon of the city
 * - Laos has only one timezone
 */

const cities = [
  {
    name: 'Vientiane',
    lat: '17.967',
    lon: '102.6',
  },
  {
    name: 'Pakse',
    lat: '15.12',
    lon: '105.799',
  },
  {
    name: 'Thakhek',
    lat: '17.41',
    lon: '104.831',
  },
  {
    name: 'Savannakhet',
    lat: '16.57',
    lon: '104.762',
  },
  {
    name: 'Luang Prabang',
    lat: '19.886',
    lon: '102.135',
  },
  {
    name: 'Xam Nua',
    lat: '20.416',
    lon: '104.045',
  },
  {
    name: 'Muang Phônsavan',
    lat: '19.449',
    lon: '103.192',
  },
  {
    name: 'Muang Xay',
    lat: '20.692',
    lon: '101.984',
  },
  {
    name: 'Vang Vieng',
    lat: '18.924',
    lon: '102.448',
  },
  {
    name: 'Pakxan',
    lat: '18.394',
    lon: '103.661',
  },
  {
    name: 'Ban Houayxay',
    lat: '20.247',
    lon: '100.454',
  },
  {
    name: 'Muang Không',
    lat: '14.118',
    lon: '105.855',
  },
];

// Pre-calculate entity codes (needed for both up() and down()), and id
for (const city of cities) {
  const uppercaseName = city.name.toUpperCase().replace(' ', '_');
  city.code = `LA_CITY_${uppercaseName}`;
  city.id = generateId();
}

const getLaosCountryEntityId = async function(db) {
  const results = await db.runSql(`SELECT id FROM entity WHERE code = 'LA';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('Entity not found');
};

const getEntityHierarchyId = async function(db) {
  const results = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = 'laos_eoc';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('Entity hierarchy not found');
};

exports.up = async function(db) {
  const parentId = await getLaosCountryEntityId(db);

  const entityHierarchyId = await getEntityHierarchyId(db);

  /*
   * Entity
   */
  let sql =
    'INSERT INTO entity (id, code, parent_id, name, type, point, country_code, metadata, timezone) VALUES \n';

  const rowsSql = [];

  for (const city of cities) {
    let rowSql = '(';

    const point = { type: 'Point', coordinates: [city.lon, city.lat] };

    rowSql +=
      `'${city.id}', ` +
      `'${city.code}', ` +
      `'${parentId}', ` +
      `'${city.name}', ` +
      `'city', ` +
      `ST_Force2D(ST_GeomFromGeoJSON('${JSON.stringify(point)}')), ` +
      `'LA', ` +
      `'{}', ` +
      `'Asia/Vientiane'`;

    rowSql += ')';

    rowsSql.push(rowSql);
  }

  sql += rowsSql.join(',\n');

  sql += ';';

  await db.runSql(sql);

  /*
   * Entity relation
   */
  for (const city of cities) {
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: parentId,
      child_id: city.id,
      entity_hierarchy_id: entityHierarchyId,
    });
  }

  return null;
};

exports.down = async function(db) {
  await db.runSql(
    `DELETE FROM entity_relation WHERE child_id IN (SELECT id FROM entity WHERE code IN (${arrayToDbString(
      cities.map(city => city.code),
    )}));`,
  );

  await db.runSql(
    `DELETE FROM entity WHERE code IN (${arrayToDbString(cities.map(city => city.code))});`,
  );

  return null;
};

exports._meta = {
  version: 1,
};
