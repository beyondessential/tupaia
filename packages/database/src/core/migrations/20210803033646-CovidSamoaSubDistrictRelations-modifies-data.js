'use strict';

import { arrayToDbString, findSingleRecord, generateId, insertObject } from '../utilities';

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

// This assumes that sub_districts have been imported via admin-panel with parent_id = parent districts
// We also need to fix the Unknown Island/Unknown District by setting parent and geodata both back to null
exports.up = async function (db) {
  const covidSamoaId = (await findSingleRecord(db, 'entity_hierarchy', { name: 'covid_samoa' })).id;

  // Fetch all sub_districts in Samoa
  const samoaSubDistricts = (
    await db.runSql(`
      select id, parent_id, code from entity where type = 'sub_district' and country_code = 'WS';
    `)
  ).rows;

  console.log('samoaSubDistricts: ', samoaSubDistricts);

  // Create entity_relations form Samoa sub_districts in covid_samoa
  await Promise.all(
    samoaSubDistricts.map(subDistrict =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: subDistrict.parent_id,
        child_id: subDistrict.id,
        entity_hierarchy_id: covidSamoaId,
      }),
    ),
  );

  // Set parent_id to null so only belong to covid_samoa
  const samoaSubDistrictCodes = samoaSubDistricts.map(sd => sd.code);
  await db.runSql(`
    update entity set "parent_id" = null 
    where "code" in (${arrayToDbString(samoaSubDistrictCodes)});
    
    update entity set "parent_id" = null where "code" = 'WS_Unknown_District';
  `);

  // update covid_samoa canonical types
  await db.runSql(`
    update entity_hierarchy set canonical_types = '{country,case,individual}' where name = 'covid_samoa';
  `);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
