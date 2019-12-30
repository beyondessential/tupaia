'use strict';
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
  // stolen function from: https://gist.github.com/jamarparris/6100413
  try {
    await db.runSql(`

      UPDATE entity
        SET parent_code = 'VE_DeltaAmacuro'
        WHERE parent_code = 'VE_Delta Amacuro';

      CREATE OR REPLACE FUNCTION generate_object_id() RETURNS varchar AS $$
        DECLARE
            time_component bigint;
            machine_id bigint := FLOOR(random() * 16777215);
            process_id bigint;
            seq_id bigint := FLOOR(random() * 16777215);
            result varchar:= '';
        BEGIN
            SELECT FLOOR(EXTRACT(EPOCH FROM clock_timestamp())) INTO time_component;
            SELECT pg_backend_pid() INTO process_id;

            result := result || lpad(to_hex(time_component), 8, '0');
            result := result || lpad(to_hex(machine_id), 6, '0');
            result := result || lpad(to_hex(process_id), 4, '0');
            result := result || lpad(to_hex(seq_id), 6, '0');
            RETURN result;
        END;
      $$ LANGUAGE PLPGSQL;
      UPDATE entity SET id = generate_object_id();

      UPDATE entity AS e1
        SET parent_code = e2.id
          FROM entity AS e2
        WHERE e1.parent_code = e2.code;

      ALTER TABLE entity 
        RENAME COLUMN parent_code TO parent_id;

      ALTER TABLE survey_response
        DROP CONSTRAINT survey_response_entity_code_fkey;

      UPDATE survey_response SET entity_code = entity.id
        FROM entity
          WHERE entity.code = survey_response.entity_code;

      ALTER TABLE survey_response 
        RENAME COLUMN entity_code TO entity_id;

      ALTER TABLE entity
        ADD CONSTRAINT entity_parent_fk FOREIGN KEY (parent_id) REFERENCES entity (id);
    `);
  } catch(e) {
    console.error(e);
    throw e;
  }
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE entity
      DROP CONSTRAINT entity_parent_fk;

    ALTER TABLE entity 
      RENAME COLUMN parent_id TO parent_code;

    UPDATE entity AS e1 SET parent_code = e2.code
      FROM entity AS e2
        WHERE e1.parent_code = e2.id;

    UPDATE entity SET id = code;

    ALTER TABLE survey_response 
      RENAME COLUMN entity_id TO entity_code;

    UPDATE survey_response SET entity_code = entity.code
      FROM entity
        WHERE entity.id = survey_response.entity_code;

    DROP FUNCTION generate_object_id();
  `);
};

exports._meta = {
  version: 1,
};
