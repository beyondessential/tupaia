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

const selectServicesProvidedOverlayGroup = async db =>
  db.runSql(`select id from map_overlay_group where code = 'Services_provided'`);

exports.up = async function (db) {
  const servicesProvidedGroupId = (await selectServicesProvidedOverlayGroup(db)).rows[0].id;
  db.runSql(`
    update map_overlay_group_relation
    set sort_order = 0
    where child_Id = '${servicesProvidedGroupId}';
  `);
};

exports.down = async function (db) {
  const servicesProvidedGroupId = (await selectServicesProvidedOverlayGroup(db)).rows[0].id;
  db.runSql(`
    update map_overlay_group_relation
    set sort_order = null
    where child_Id = '${servicesProvidedGroupId}';
  `);
};

exports._meta = {
  version: 1,
};
