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

exports.up = (db) => {
  return db.runSql(`
    CREATE TABLE public.entity_relation_type (
      code TEXT PRIMARY KEY,
      description TEXT
    );

    CREATE TABLE public.entity_relation (
      id TEXT PRIMARY KEY,
      from_id TEXT NOT NULL,
      to_id TEXT NOT NULL,
      entity_relation_type_code TEXT NOT NULL,
      FOREIGN KEY (entity_relation_type_code) REFERENCES entity_relation_type (code),
      FOREIGN KEY (from_id) REFERENCES entity (id),
      FOREIGN KEY (to_id) REFERENCES entity (id)
    );

    INSERT INTO public.entity_relation_type 
      (code, description)
    VALUES
      ('water_catchment_parent', 'Catchments for WISH FIJI');
  `);
};

exports.down = function(db) {
  return db.runSql(`
  DROP TABLE public.entity_relation;
  DROP TABLE public.entity_relation_type;
`);
};

exports._meta = {
  version: 1,
};
