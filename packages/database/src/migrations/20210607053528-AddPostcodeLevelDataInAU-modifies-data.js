'use strict';

import { generateId, codeToId, insertObject } from '../utilities';
import POSTCODE_ARRAY from './migrationData/20210607053528-AddPostcodeLevelDataInAU.json';

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

const STATES = {
  ACT: 'AU_Australian Capital Territory',
  NT: 'AU_Northern Territory',
  NSW: 'AU_New South Wales',
  VIC: 'AU_Victoria',
  QLD: 'AU_Queensland',
  WA: 'AU_Western Australia',
  TAS: 'AU_Tasmania',
  SA: 'AU_South Australia',
};

const HIERARCHY_CODE = 'covidau';

exports.up = async function (db) {
  for (const data of POSTCODE_ARRAY) {
    // Insert into entity table
    const { postcode, state, long, lat } = data;
    const entityCode = `AU_${state}_${postcode}`;
    const isExisted = await codeToId(db, 'entity', entityCode);
    // There are same postcodes for multiple area from JSON, but they have similar latitude and longitude, we can pick one of them.
    if (isExisted) {
      continue;
    }
    const entity = {
      id: generateId(),
      code: entityCode,
      parent_id: await codeToId(db, 'entity', STATES[state]),
      name: postcode,
      type: 'postcode',
      country_code: 'AU',
      metadata: {
        dhis: {
          isDataRegional: true,
        },
        openStreetMaps: {},
      },
    };
    const point = { type: 'Point', coordinates: [long, lat] };
    await insertObject(db, 'entity', entity);
    await db.runSql(`
        update entity 
        SET point = ST_Force2D(ST_GeomFromGeoJSON('${JSON.stringify(point)}'))
        where code = '${entity.code}';
    `);
    // Insert relationships into entity_relation table
    await db.runSql(
      `UPDATE entity_hierarchy SET canonical_types = '{country, district, sub_district, postcode}' WHERE name = '${HIERARCHY_CODE}';`,
    );
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
