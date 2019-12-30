'use strict';

import { insertMultipleObjects } from '../migrationUtilities';

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

const common = {
  groupName: 'Disaster response',
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: true,
  userGroup: 'Admin',
  values: [{ color: 'blue', value: 'other' }, { color: 'grey', value: null }],
};

const overlays = [
  {
    name: '# of usable beds',
    dataElementCode: 'DP9',
    displayType: 'radius',
  },
  {
    name: 'Average births/month',
    dataElementCode: 'DP_NEW004',
    displayType: 'radius',
  },
  {
    name: 'Average patients/day',
    dataElementCode: 'DP_NEW002',
    displayType: 'radius',
  },
  {
    name: 'Current # of diarrhoea cases',
    dataElementCode: 'DP_NEW007',
    displayType: 'radius',
  },
];

exports.up = function(db) {
  return insertMultipleObjects(db, 'mapOverlay', overlays.map(o => ({ ...common, ...o })));
};

exports.down = function(db) {
  var chain = Promise.resolve();
  overlays.map(o => {
    var { dataElementCode } = o;
    chain = chain.then(() =>
      db.runSql(
        `
      DELETE FROM "mapOverlay" WHERE "dataElementCode" = ?
    `,
        [dataElementCode],
      ),
    );
  });
  return chain;
};

exports._meta = {
  version: 1,
};
