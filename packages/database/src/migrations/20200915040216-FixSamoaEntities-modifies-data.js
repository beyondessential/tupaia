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

/**
  * This migration deletes two districts from the database
  * and updates one existing facility by fixing/adding it in relevant locations
  */

//Below are the ids of all the entities being updated in various tables

 const newFacilityEntityId = generateId();
 const motootuaDistrictEntityId = '5eba39e161f76a3da3000011';
 const tuamasagaDistrictEntityId = '5eba39e161f76a3da3000010';
 const upoluGeoAreaId = '5df1b88c61f76a485cd65ea6';
 const motootuaHospitalClinicId = '5a7bda413ec0d460d2b06d08';
 const motootuaGeoAreaId = '5a7bda413ec0d460d2ac6024';
 const tuamasagaGeoAreaId = '5a7bda413ec0d460d2a77ef8';

//This is a really dumb solution to solve an issue where an existing district that will be deleted has the code of a facility being added to the entity table
 const tempCode = 'thisCodeIsTemp';

exports.up = function(db) {
  return db.runSql(`

    update entity set code='${tempCode}' where id='${motootuaDistrictEntityId}';

    INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata", "attributes")
    VALUES 
    (
      '${newFacilityEntityId}',
      'WS_SAMOA_1',
      '5df1b88c61f76a485cd7815a',
      'Moto''otua Hospital',
      'facility',
      NULL,
      NULL,
      NULL,
      'WS',
      NULL,
      '{"dhis": {"isDataRegional": true}}',
      '{}'
    );

    update survey_response set entity_id='${newFacilityEntityId}' where entity_id='${motootuaDistrictEntityId}';

    delete from entity where id='${motootuaDistrictEntityId}';

    delete from entity where id='${tuamasagaDistrictEntityId}';

    update clinic set geographical_area_id='${upoluGeoAreaId}' where id='${motootuaHospitalClinicId}';

    delete from geographical_area where id='${motootuaGeoAreaId}';

    delete from geographical_area where id='${tuamasagaGeoAreaId}';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    INSERT INTO "geographical_area" ("id", "name", "level_code", "level_name", "country_id", "parent_id", "code")
    VALUES 
    (
      '${tuamasagaGeoAreaId}',
      'Tuamasaga',
      'district',
      'District',
      '5a7bda413ec0d460d2a3742e',
      NULL,
      NULL
    );

    INSERT INTO "geographical_area" ("id", "name", "level_code", "level_name", "country_id", "parent_id", "code")
    VALUES 
    (
      '${motootuaGeoAreaId}',
      'Moto''otua',
      'sub_district',
      'Sub District',
      '5a7bda413ec0d460d2a3742e',
      '${tuamasagaGeoAreaId}',
      NULL
    );

    update clinic set geographical_area_id='${motootuaGeoAreaId}' where id='${motootuaHospitalClinicId}';

    update entity set code='${tempCode}' where id='${newFacilityEntityId}';

    INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata", "attributes")
    VALUES 
    (
      '${tuamasagaDistrictEntityId}',
      'WS_TUAMASAGA',
      '5df1b88c61f76a485cd1ca09',
      'Tuamasaga',
      'district',
      NULL,
      NULL,
      NULL,
      'WS',
      NULL,
      NULL,
      '{}'
    );

    INSERT INTO "entity" ("id", "code", "parent_id", "name", "type", "point", "region", "image_url", "country_code", "bounds", "metadata", "attributes")
    VALUES 
    (
      '${motootuaDistrictEntityId}',
      'WS_SAMOA_1',
      '5df1b88c61f76a485cd1ca09',
      'Moto''otua',
      'district',
      NULL,
      NULL,
      NULL,
      'WS',
      NULL,
      NULL,
      '{}'
    );

    update survey_response set entity_id='${motootuaDistrictEntityId}' where entity_id='${newFacilityEntityId}';

    delete from entity where id='${newFacilityEntityId}';
    `);
};

exports._meta = {
  "version": 1
};
