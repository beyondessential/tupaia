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
      DROP TABLE entity_relation;
      DROP TABLE entity_relation_type;
      CREATE TYPE entity_hierarchy_type AS ENUM('project', 'water_catchment');
      CREATE TABLE public.entity_relation (
        id TEXT PRIMARY KEY,
        parent_id TEXT NOT NULL,
        child_id TEXT NOT NULL,
        hierarchy_type entity_hierarchy_type NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES entity (id),
        FOREIGN KEY (child_id) REFERENCES entity (id)
      );
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
  return updateProject(db, 'explore', 'General', `'Wo'`, 'world');
};

const updateProject = (db, projectCode, projectDescription, countryCodes, entityType) => {
  const projectId = generateId();

  return db.runSql(`
    insert into "entity" ("id", "code", "parent_id", "name", "type" ) values ('${projectId}', '${projectCode}', '5d3f8844a72aa231bf71977f', '${projectDescription}', 'project');
    insert into "entity_relation" (
          select
              '${generateId().slice(
                0,
                -1,
              )}' || LPAD(row_number() OVER()::text, 1, '0'), '${projectId}',  id, 'project'
            from "entity"
            where country_code in (${countryCodes})
             and  type in ('${entityType}'));

    update "project" set "entity_id" = '${projectId}' where "code" ='${projectCode}';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE entity_relation;

    CREATE TABLE entity_relation_type (
      code TEXT PRIMARY KEY,
      description TEXT
    );

    CREATE TABLE entity_relation (
      id TEXT PRIMARY KEY,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      entity_relation_type_code TEXT NOT NULL,
      FOREIGN KEY (entity_relation_type_code) REFERENCES entity_relation_type (code),
      FOREIGN KEY (from_id) REFERENCES entity (id),
      FOREIGN KEY (to_id) REFERENCES entity (id)
    );

    DELETE FROM entity WHERE type = 'project';
  `);
};

exports._meta = {
  version: 1,
};
