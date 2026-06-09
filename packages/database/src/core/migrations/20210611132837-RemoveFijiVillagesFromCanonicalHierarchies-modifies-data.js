'use strict';

import { updateValues } from '../utilities';

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
  const villages = (
    await db.runSql(`
    select e.id, er.parent_id 
    from entity e 
    join entity_relation er on er.child_id = e.id 
      and er.entity_hierarchy_id = (select id from "entity_hierarchy" where "name" = 'wish') 
    where e.type = 'village' and e.country_code = 'FJ' 
  `)
  ).rows;

  const results = await Promise.all(
    villages.map(village =>
      updateValues(db, 'entity', { parent_id: village.parent_id }, { id: village.id }),
    ),
  );
  return results;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
