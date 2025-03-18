'use strict';

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

exports.up = function (db) {
  // Grant Tupaia Admin Panel access to Laos for all users who have LESMIS Admin but don't have Tupaia Admin Panel
  return db.runSql(`
    insert into user_entity_permission (id, user_id, permission_group_id, entity_id)
    select
    	generate_object_id() as id,
    	id as user_id, 
    	(select id from permission_group where name = 'Tupaia Admin Panel') as permission_group_id, 
    	(select id from entity where code = 'LA') as entity_id
    from user_account
    where 
    -- has LESMIS Admin access to Laos
    id in 
    	(select uep1.user_id from user_entity_permission uep1
         join entity e1 on uep1.entity_id = e1.id
         join permission_group pg1 on uep1.permission_group_id = pg1.id
         where e1.code = 'LA' and pg1.name = 'LESMIS Admin')
    and 
    -- does not have Tupaia Admin Panel access to Laos
    id not in
    	(select uep2.user_id from user_entity_permission uep2
         join entity e2 on uep2.entity_id = e2.id
         join permission_group pg2 on uep2.permission_group_id = pg2.id
         where e2.code = 'LA' and pg2.name = 'Tupaia Admin Panel') 
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
