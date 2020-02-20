'use strict';

import { generateId } from '../utilities/generateId';

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

exports.up = async function(db) {
  await db.runSql(`
      ALTER TABLE entity_relation ALTER COLUMN entity_relation_type_code drop not null;
      ALTER TABLE entity_relation DROP CONSTRAINT entity_relation_entity_relation_type_code_fkey;
      ALTER TABLE project drop column entity_ids;
      ALTER TABLE project drop column name;
      ALTER TABLE project add column entity_id text;
    `);

  await updateProject(db, 'unfpa', 'UNFPA', `'WS','MH','TO','FM'`, 'country');
  await updateProject(db, 'imms', 'Immunization Module', `'VU','SB'`, 'country');
  await updateProject(db, 'fanafana', 'Fanafana Ola', `'TO'`, 'country');
  await updateProject(db, 'disaster', 'Disaster Response', `'Wo'`, 'world');
  await updateProject(db, 'wish', 'WISH Fiji', `'FJ'`, 'country');
  await updateProject(db, 'strive', 'STRIVE PNG', `'PG'`, 'country');
  await updateProject(db, 'explore', 'General', `'Wo'`, 'world');
  return null;
};

const updateProject = (db, projectCode, projectDescription, countryCodes, type) => {
  const projectId = generateId();

  return db.runSql(`
    insert into "entity" ("id", "code", "parent_id", "name", "type" ) values ('${projectId}', '${projectCode}', '5d3f8844a72aa231bf71977f', '${projectDescription}', 'project');
    insert into "entity_relation" (
          select
              '${generateId().slice(
                0,
                -1,
              )}' || LPAD(row_number() OVER()::text, 1, '0'), '${projectId}',  id, ''
            from "entity"
            where country_code in (${countryCodes})
             and  type in ('${type}'));

    update "project" set "entity_id" = '${projectId}' where "code" ='${projectCode}';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    delete from entity_relation;
    delete from entity e2 where e2."type" = 'project';  
  `);
};

exports._meta = {
  version: 1,
};
