'use strict';

import { updateValues } from '../utilities';

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

const projectCode = 'unfpa';
const previousConfig = {
  permanentRegionLabels: true,
  projectDashboardHeader: 'Regional',
};
const newConfig = {
  tileSets: 'unfpaPopulation',
  includeDefaultTileSets: true,
  permanentRegionLabels: true,
  projectDashboardHeader: 'Regional',
};

exports.up = async function (db) {
  await updateValues(db, 'project', { config: newConfig }, { code: projectCode });
};

exports.down = async function (db) {
  await updateValues(db, 'project', { config: previousConfig }, { code: projectCode });
};

exports._meta = {
  version: 1,
};
