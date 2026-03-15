'use strict';

import { codeToId, findSingleRecord, insertObject, generateId } from '../utilities';

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

const exploreCanonicalTypes = '{country,district,sub_district,postcode,village,facility}';
const covidSamoaCanonicalTypes = '{country,facility,village,case,individual}';

// We want to add postcode types to explore. Currently twos samoa districts were added as
// entity_relations in explore to 'hide' the covid_samoa specific 'Unknown' entities,
// instead we'll remove the entity_relation entries so explore remains 'canonical' and
// set 'Unknown District' parent_id = null and add district entity_relations for covid_samoa.
exports.up = async function (db) {
  // Find ids from codes
  const samoaId = await codeToId(db, 'entity', 'WS');
  const exploreId = (await findSingleRecord(db, 'entity_hierarchy', { name: 'explore' })).id;
  const covidSamoaId = (await findSingleRecord(db, 'entity_hierarchy', { name: 'covid_samoa' })).id;

  // Update canonical types for explore and covid_samoa
  // Remove Samoa Districts from explore entity_relations
  await db.runSql(` 
    update entity_hierarchy set canonical_types = '${exploreCanonicalTypes}' where name = 'explore';
    update entity_hierarchy set canonical_types = '${covidSamoaCanonicalTypes}' where name = 'covid_samoa';

    delete from "entity_relation" where "parent_id" = '${samoaId}' and "entity_hierarchy_id" = '${exploreId}';

  `);

  // Create entity_relations form Samoa districts in covid_samoa
  const samoaDistricts = (
    await db.runSql(`select id, code from entity where parent_id = '${samoaId}';`)
  ).rows;

  await Promise.all(
    samoaDistricts.map(district =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: samoaId,
        child_id: district.id,
        entity_hierarchy_id: covidSamoaId,
      }),
    ),
  );

  // set Unknown District parent_id to null so doesn't show up in other samoa projects
  await db.runSql(`update entity set "parent_id" = null where "code" = 'WS_Unknown_District'`);
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
