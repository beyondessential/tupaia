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

/**
 * This migration deletes two districts and a redundant hospital from the database
 * and updates a survey response to be associated with the correct hospital entity
 */

// Below are the ids of all the entities being deleted/updated in various tables

const motootuaDistrictEntityId = '5eba39e161f76a3da3000011';
const tuamasagaDistrictEntityId = '5eba39e161f76a3da3000010';
const motootuaHospitalClinicId = '5a7bda413ec0d460d2b06d08';
const motootuaGeoAreaId = '5a7bda413ec0d460d2ac6024';
const tuamasagaGeoAreaId = '5a7bda413ec0d460d2a77ef8';

exports.up = function (db) {
  return db.runSql(`
      delete from clinic where id='${motootuaHospitalClinicId}';

      delete from entity where id in ('${motootuaDistrictEntityId}', '${tuamasagaDistrictEntityId}');

      delete from geographical_area where id in('${motootuaGeoAreaId}', '${tuamasagaGeoAreaId}');
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
