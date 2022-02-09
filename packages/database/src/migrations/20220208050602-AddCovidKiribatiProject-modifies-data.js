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

const PROJECT_NAME = 'COVID-19 Kiribati';

const PROJECT = {
  name: PROJECT_NAME,
  description: 'COVID-19 case surveillance and data visualisations in Kiribati',
  sort_order: 16,
  image_url: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/thumbnails/uploads/covid_kiribati_background.jpeg',
  default_measure: 'https://tupaia.s3.ap-southeast-2.amazonaws.com/thumbnails/uploads/covid_kiribati_logo.png',
  dashboard_group_name: 'General',
  permission_groups: '{COVID-19 Kiribati Admin,COVID-19 Kiribati}',
  logo_url: '',
  entity_id: '',
  entity_hierarchy_id: '',
};

const ENTITY = {
  code: 'covid_kiribati',
  name: PROJECT_NAME,
  type: 'project',
  bounds: 
  parent_id: await codeToId(db, 'entity', 'World'),
};

exports.up = function (db) {
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
