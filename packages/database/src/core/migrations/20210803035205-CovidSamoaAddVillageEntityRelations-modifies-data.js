'use strict';

import { villageRelations } from './migrationData/20210803014704-CovidSamoaAddSubDistrictEntities/Entities - Village Update 20210802';
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

exports.up = async function (db) {
  // console.log('villageRelations: ', villageRelations);
  const villageCodes = Object.keys(villageRelations);
  const subDistrictCodes = Object.values(villageRelations);

  const samoaVillageRows = (
    await db.runSql(`
      select code, id from entity where "code" in (${arrayToDbString(villageCodes)});
    `)
  ).rows;
  const samoaVillageIds = Object.assign({}, ...samoaVillageRows.map(x => ({ [x.code]: x.id })));
  // console.log('samoaVillageIds: ', samoaVillageIds);

  const subDistrictRows = (
    await db.runSql(`
      select code, id from entity where "code" in (${arrayToDbString(subDistrictCodes)});
    `)
  ).rows;
  const subDistrictIds = Object.assign({}, ...subDistrictRows.map(x => ({ [x.code]: x.id })));
  // console.log('subDistrictIds: ', subDistrictIds);

  const covidSamoaId = (await findSingleRecord(db, 'entity_hierarchy', { name: 'covid_samoa' })).id;

  await Promise.all(
    Object.keys(villageRelations).map(villageCode =>
      insertObject(db, 'entity_relation', {
        id: generateId(),
        parent_id: subDistrictIds[villageRelations[villageCode]],
        child_id: samoaVillageIds[villageCode],
        entity_hierarchy_id: covidSamoaId,
      }),
    ),
  );
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
