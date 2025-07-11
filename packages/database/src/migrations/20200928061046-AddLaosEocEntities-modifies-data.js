'use strict';

import { arrayToDbString, generateId, insertObject } from '../utilities';

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

/*
 * Each province has a capital and each capital has a point center lat/lon.
 * See: https://www.wikiwand.com/en/Administrative_divisions_of_Laos
 *
 * Each province already has bounds set in the database.
 */
const PROVINCES = {
  Attapeu: {
    capital: {
      name: 'Attapeu',
      lat: 14.82,
      lon: 106.820556,
    },
  },
  Bokeo: {
    capital: {
      name: 'Houayxay',
      lat: 20.263056,
      lon: 100.433611,
    },
  },
  Bolikhamsai: {
    capital: {
      name: 'Pakxan',
      lat: 18.396389,
      lon: 103.655833,
    },
  },
  Champasak: {
    capital: {
      name: 'Pakse',
      lat: 15.116667,
      lon: 105.783333,
    },
  },
  Houaphanh: {
    capital: {
      name: 'Xam Neua',
      lat: 20.415,
      lon: 104.048,
    },
  },
  Khammouane: {
    capital: {
      name: 'Thakhek',
      lat: 17.4,
      lon: 104.8,
    },
  },
  'Luang Namtha': {
    capital: {
      name: 'Luang Namtha',
      lat: 20.95,
      lon: 101.4,
    },
  },
  'Luang Prabang': {
    capital: {
      name: 'Luang Prabang',
      lat: 19.883333,
      lon: 102.133333,
    },
  },
  Oudomxay: {
    capital: {
      name: 'Muang Xay',
      lat: 20.691389,
      lon: 101.986111,
    },
  },
  Phongsaly: {
    capital: {
      name: 'Phongsali',
      lat: 21.683333,
      lon: 102.1,
    },
  },
  Sainyabuli: {
    capital: {
      name: 'Sainyabuli',
      lat: 19.416667,
      lon: 103.166667,
    },
  },
  Salavan: {
    capital: {
      name: 'Salavan',
      lat: 15.716667,
      lon: 106.416667,
    },
  },
  Savannakhet: {
    capital: {
      name: 'Savannakhet',
      lat: 16.55,
      lon: 104.75,
    },
  },
  Sekong: {
    capital: {
      name: 'Sekong',
      lat: 15.344444,
      lon: 106.7175,
    },
  },
  'Vientiane Prefecture': {
    capital: {
      name: 'Vientiane',
      lat: 17.966667,
      lon: 102.6,
    },
  },
  'Vientiane Province': {
    capital: {
      name: 'Muang Phôn-Hông',
      lat: 18.5,
      lon: 102.416667,
    },
  },
  Xiangkhouang: {
    capital: {
      name: 'Phonsavan',
      lat: 19.416667,
      lon: 103.166667,
    },
  },
  Xaisomboun: {
    capital: {
      name: 'Anouvong',
      lat: 18.9057,
      lon: 103.092,
    },
  },
};

// Pre-calculate entity codes (needed for both up() and down()), and id
for (const provinceName of Object.keys(PROVINCES)) {
  const { capital } = PROVINCES[provinceName];
  const uppercaseName = capital.name.toUpperCase().replace(' ', '_');
  PROVINCES[provinceName].capital.code = `LA_PROV_CAPITAL_${uppercaseName}`;
  PROVINCES[provinceName].capital.id = generateId();
}

const getLaosCountryEntityId = async function (db) {
  const results = await db.runSql(`SELECT id FROM entity WHERE code = 'LA';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('Entity not found');
};

const getEntityHierarchyId = async function (db) {
  const results = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = 'laos_eoc';`);

  if (results.rows.length > 0) {
    return results.rows[0].id;
  }

  throw new Error('Entity hierarchy not found');
};

exports.up = async function (db) {
  const parentId = await getLaosCountryEntityId(db);

  const entityHierarchyId = await getEntityHierarchyId(db);

  /*
   * Entity
   */
  let sql =
    'INSERT INTO entity (id, code, parent_id, name, type, point, country_code, bounds, metadata) VALUES \n';

  const rowsSql = [];

  for (const province of Object.values(PROVINCES)) {
    let rowSql = '(';

    const point = { type: 'Point', coordinates: [province.capital.lon, province.capital.lat] };

    rowSql +=
      `'${province.capital.id}', ` +
      `'${province.capital.code}', ` +
      `'${parentId}', ` +
      `'${province.capital.name}', ` +
      `'city', ` +
      `ST_Force2D(ST_GeomFromGeoJSON('${JSON.stringify(point)}')), ` +
      `'LA', ` +
      `ST_Expand(ST_Envelope(ST_GeomFromGeoJSON('${JSON.stringify(point)}')::geometry), 1), ` +
      `'{}'`;

    rowSql += ')';

    rowsSql.push(rowSql);
  }

  sql += rowsSql.join(',\n');

  sql += ';';

  await db.runSql(sql);

  /*
   * Entity relation
   */
  for (const province of Object.values(PROVINCES)) {
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: parentId,
      child_id: province.capital.id,
      entity_hierarchy_id: entityHierarchyId,
    });
  }

  return null;
};

exports.down = async function (db) {
  await db.runSql(
    `DELETE FROM entity_relation WHERE child_id IN (SELECT id FROM entity WHERE code IN (${arrayToDbString(
      Object.values(PROVINCES).map(province => province.capital.code),
    )}));`,
  );

  await db.runSql(
    `DELETE FROM entity WHERE code IN (${arrayToDbString(
      Object.values(PROVINCES).map(province => province.capital.code),
    )});`,
  );

  return null;
};

exports._meta = {
  version: 1,
};
