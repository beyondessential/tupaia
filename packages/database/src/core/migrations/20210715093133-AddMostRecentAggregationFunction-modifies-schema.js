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
  return db.runSql(`

  drop aggregate if exists most_recent(text, timestamp);
  
  drop function if exists most_recent_fn;
  
  drop function if exists most_recent_final_fn;

  drop type if exists value_and_date;

  create type value_and_date as (
    value text,
    date timestamp
  );
  
  create FUNCTION most_recent_fn(value_and_date,text,timestamp) RETURNS value_and_date AS $$
    SELECT 
      case
        when $3 > $1.date then ($2, $3)::value_and_date 
        else $1
      end
  $$ LANGUAGE SQL; 
  
  create FUNCTION most_recent_final_fn(value_and_date) RETURNS text AS $$
      SELECT $1.value;
  $$ LANGUAGE SQL; 
  
  create AGGREGATE most_recent(text, timestamp) (
      sfunc = most_recent_fn,
      stype = value_and_date, 
      finalfunc = most_recent_final_fn,
      initcond = '(NULL,-infinity)'
  );
  `);
};

exports.down = function (db) {
  return db.runSql(`
  
  drop aggregate if exists most_recent(text, timestamp);
  
  drop function if exists most_recent_fn;
  
  drop function if exists most_recent_final_fn;

  drop type if exists value_and_date;
  `);
};

exports._meta = {
  version: 1,
};
