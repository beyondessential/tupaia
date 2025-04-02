'use strict';

import { arrayToDbString } from '../utilities';

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

const facilityIds = ['Bdkm1D71zPn'];

const fetchCodes = (db, ids) =>
  db.runSql(`
    select "entity_code" as codes from "data_service_entity" 
    where "config" ->> 'dhis_id' in (${arrayToDbString(ids)});
  `);

exports.up = async function (db) {
  const codes = (await fetchCodes(db, facilityIds)).rows.map(r => r.codes);

  return db.runSql(`
    delete from "clinic" where code in (${arrayToDbString(codes)}); 
    delete from "data_service_entity" where "entity_code" in (${arrayToDbString(codes)}); 
    delete from "entity" where "code" in (${arrayToDbString(codes)}); 
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
