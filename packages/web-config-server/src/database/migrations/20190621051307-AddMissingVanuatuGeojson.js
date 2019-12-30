'use strict';

var dbm;
var type;
var seed;

const TAF02 = require('../migrationData/20190621051307-AddMissingVanuatuGeojson/VU_Tafea_TAF02.json');
const TAF03 = require('../migrationData/20190621051307-AddMissingVanuatuGeojson/VU_Tafea_TAF03.json');
const TAF04 = require('../migrationData/20190621051307-AddMissingVanuatuGeojson/VU_Tafea_TAF04.json');

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
  return db.runSql(`
    UPDATE "entity"
      SET region = ST_GeomFromGeoJSON('${TAF02.geojson}')
      WHERE code = 'VU_Tafea_TAF02';

    UPDATE "entity"
      SET region = ST_GeomFromGeoJSON('${TAF03.geojson}')
      WHERE code = 'VU_Tafea_TAF03';

    UPDATE "entity"
      SET region = ST_GeomFromGeoJSON('${TAF04.geojson}')
      WHERE code = 'VU_Tafea_TAF04';

    UPDATE "entity" 
      SET "bounds" = ST_Envelope("region"::geometry) 
      WHERE "code" IN ('VU_Tafea_TAF02', 'VU_Tafea_TAF03', 'VU_Tafea_TAF04');
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "entity"
      SET region = NULL
      WHERE code = 'VU_Tafea_TAF02';

    UPDATE "entity"
      SET region = NULL
      WHERE code = 'VU_Tafea_TAF03';

    UPDATE "entity"
      SET region = NULL
      WHERE code = 'VU_Tafea_TAF04';

    UPDATE "entity" 
      SET "bounds" = NULL
      WHERE "code" IN ('VU_Tafea_TAF02', 'VU_Tafea_TAF03', 'VU_Tafea_TAF04');
  `);
};

exports._meta = {
  "version": 1
};
