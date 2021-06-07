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
const getExploreHierarchyId = async db =>
  db.runSql(`select id from entity_hierarchy where name = '${HIERARCHY_CODE}' limit 1;`);

exports.up = async function (db) {
  for (const data of POSTCODE_ARRAY) {
    // Insert into entity table
    const { postcode, state, long, lat } = data;
    const entityCode = `AU_${state}_${postcode}`;
    const isExisted = await codeToId(db, 'entity', entityCode);
    if (isExisted) {
      continue;
    }
    const parentId = await codeToId(db, 'entity', STATES[state]);
    const entityId = generateId();
    const entity = {
      id: entityId,
      code: entityCode,
      parent_id: parentId,
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
    //   const hierarchyId = (await getExploreHierarchyId(db)).rows[0].id;
    //   await insertObject(db, 'entity_relation', {
    //     id: generateId(),
    //     parent_id: parentId,
    //     child_id: entityId,
    //     entity_hierarchy_id: hierarchyId,
    //   });
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
