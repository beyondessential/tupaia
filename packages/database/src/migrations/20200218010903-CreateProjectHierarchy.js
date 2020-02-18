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

exports.up = function(db) {
  const unfpaProjectId = generateId();
  const immsProjectId = generateId();
  const fanafanaProjectId = generateId();
  const disasterProjectId = generateId();
  const wishProjectId = generateId();
  const striveProjectId = generateId();
  const exploreId = generateId();

  return db.runSql(
    `
    ALTER TABLE entity_relation ALTER COLUMN entity_relation_type_code drop not null;
    ALTER TABLE entity_relation DROP CONSTRAINT entity_relation_entity_relation_type_code_fkey;
    ALTER TABLE project drop column entity_ids;
    ALTER TABLE project drop column name;   
    ALTER TABLE project add column entity_id text; 
    
    insert into entity (id, code, parent_id, "name", type ) values ('${unfpaProjectId}', 'unfpa', '5d3f8844a72aa231bf71977f', 'UNFPA', 'project');
    insert into entity_relation ( 
            select '${generateId().slice(
              0,
              -1,
            )}' || LPAD(row_number() OVER()::text, 1, '0'), '${unfpaProjectId}',  id, '' 
            from entity where country_code in ('WS','MH','TO','FM')
            and type in ('country'));

    update project set entity_id = '${unfpaProjectId}' where code ='unfpa';

    insert into entity (id, code, parent_id, "name", type ) values ('${immsProjectId}', 'imms', '5d3f8844a72aa231bf71977f', 'Immunization Module', 'project');
    insert into entity_relation ( 
            select '${generateId().slice(
              0,
              -1,
            )}' || LPAD(row_number() OVER()::text, 1, '0'), '${immsProjectId}',  id, '' 
            from entity where country_code in ('VU','SB')
            and type in ('country'));

    update project set entity_id = '${immsProjectId}' where code ='imms';

    insert into entity (id, code, parent_id, "name", type ) values ('${fanafanaProjectId}', 'fanafana', '5d3f8844a72aa231bf71977f', 'Fanafana Ola', 'project');
    insert into entity_relation ( 
            select '${generateId().slice(
              0,
              -1,
            )}' || LPAD(row_number() OVER()::text, 1, '0'), '${fanafanaProjectId}',  id, '' 
            from entity where country_code in ('TO')
            and type in ('country'));

    update project set entity_id = '${fanafanaProjectId}' where code ='fanafana';


    insert into entity (id, code, parent_id, "name", type ) values ('${disasterProjectId}', 'disaster', '5d3f8844a72aa231bf71977f', 'Disaster Response', 'project');
    insert into entity_relation ( 
            select '${generateId().slice(
              0,
              -1,
            )}' || LPAD(row_number() OVER()::text, 1, '0'), '${disasterProjectId}',  id, '' 
            from entity where type = 'world');

    update project set entity_id = '${disasterProjectId}' where code ='disaster';


    insert into entity (id, code, parent_id, "name", type ) values ('${wishProjectId}', 'wish', '5d3f8844a72aa231bf71977f', 'WISH Fiji', 'project');
    insert into entity_relation ( 
            select '${generateId().slice(
              0,
              -1,
            )}' || LPAD(row_number() OVER()::text, 1, '0'), '${wishProjectId}',  id, '' 
            from entity where country_code in ('FJ')
            and type in ('country'));

    update project set entity_id = '${wishProjectId}' where code ='wish';    


    insert into entity (id, code, parent_id, "name", type ) values ('${striveProjectId}', 'strive', '5d3f8844a72aa231bf71977f', 'STRIVE PNG', 'project');
    insert into entity_relation ( 
            select '${generateId().slice(
              0,
              -1,
            )}' || LPAD(row_number() OVER()::text, 1, '0'), '${striveProjectId}',  id, '' 
            from entity where country_code in ('PG')
            and type in ('country'));

    update project set entity_id = '${striveProjectId}' where code ='strive';

    insert into entity (id, code, parent_id, "name", type ) values ('${exploreId}', 'explore', '5d3f8844a72aa231bf71977f', 'General', 'project');
    insert into entity_relation ( 
            select '${generateId().slice(
              0,
              -1,
            )}' || LPAD(row_number() OVER()::text, 1, '0'), '${exploreId}',  id, '' 
            from entity where country_code in ('Wo')
            );

    update project set entity_id = '${exploreId}' where code ='explore';
  `,
  );
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
