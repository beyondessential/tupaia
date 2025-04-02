'use strict';

import { deleteObject } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const OBSOLETE_REPORT_CODE = 'Laos_Schools_Male_Female';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // Drop the old student gender pie chart
  await deleteObject(db, 'legacy_report', { code: OBSOLETE_REPORT_CODE });
  await deleteObject(db, 'dashboard_item', { code: OBSOLETE_REPORT_CODE }); // cascades to dashboard_relation
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
