'use strict';

import { rejectOnError } from '../migrationUtilities';

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

exports.up = function(db) {
  return Promise.all([
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardReport',
        ['id', 'dataBuilder', 'viewJson', 'dataBuilderConfig', 'isDataRegional'],
        [
          'Disaster_Response_Downloadable_Resources',
          'externalLink',
          `{
        "name": "Downloadable Resources",
        "type": "view",
        "viewType": "singleDownloadLink"
      }`,
          `{
        "url": "https://info.tupaia.org/disaster-response-{organisationUnitCode}"
      }`,
          true,
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
    new Promise((resolve, reject) =>
      db.insert(
        'dashboardGroup',
        [
          'code',
          'organisationLevel',
          'userGroup',
          'organisationUnitCode',
          'name',
          'dashboardReports',
        ],
        [
          'Disaster_Response_Country',
          'Country',
          'Admin',
          'DL',
          'Disaster Response',
          '{Disaster_Response_Downloadable_Resources}',
        ],
        error => rejectOnError(resolve, reject, error),
      ),
    ),
  ]);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
