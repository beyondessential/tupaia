'use strict';

import { insertObject } from '../migrationUtilities';

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

exports.up = async function(db) {
  await db.runSql(`
    UPDATE "mapOverlay" SET "userGroup" = 'Vanuatu EPI' WHERE "groupName" = 'Immunisations';
  `);

  const mapOverlayBase = {
    groupName: 'Immunisations',
    userGroup: 'Vanuatu EPI',
    displayType: 'color',
    isDataRegional: true,
    hideFromMenu: false,
    hideFromPopup: false,
    hideFromLegend: false,
    measureBuilderConfig: '{"organisationUnitLevel": "Facility"}',
    measureBuilder: 'valueForOrgGroup',
    countryCodes: '{VU}',
    values: [
      { value: 0, name: 'No breaches', color: 'green' },
      { value: 1, name: '1 or more', color: 'red' },
    ],
  };

  await insertObject(db, 'mapOverlay', {
    ...mapOverlayBase,
    name: 'Temperature Breaches (48 hours)',
    dataElementCode: 'BREACH_LAST_48_HOURS',
    sortOrder: -1,
  });

  await insertObject(db, 'mapOverlay', {
    ...mapOverlayBase,
    name: 'Temperature Breaches (30 days)',
    dataElementCode: 'BREACH_LAST_30_DAYS',
    sortOrder: 0,
  });
};

exports.down = function(db) {
  return db.runSql(`
    DELETE FROM
      "mapOverlay"
    WHERE
      "name" LIKE 'Temperature Breaches%' AND "groupName" = 'Immunisations';

    UPDATE "mapOverlay" SET "userGroup" = 'Donor' WHERE "groupName" = 'Immunisations';
  `);
};

exports._meta = {
  version: 1,
};
