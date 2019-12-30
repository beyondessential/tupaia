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

const BREACH_LAST_30_DAYS = 'BREACH_LAST_30_DAYS';
const FRIDGE_DAILY = 'FRIDGE_DAILY';
const FRIDGE_SOH_VALUE = 'FRIDGE_SOH_VALUE';

exports.up = async function(db) {
  const mapOverlayBase = {
    groupName: 'Immunisations',
    userGroup: 'Vanuatu EPI',
    isDataRegional: true,
    measureBuilder: 'valueForOrgGroup',
    countryCodes: '{VU}',
  };

  await insertObject(db, 'mapOverlay', {
    ...mapOverlayBase,
    id: FRIDGE_SOH_VALUE,
    name: 'SOH Value',
    dataElementCode: FRIDGE_SOH_VALUE,
    displayType: 'radius',
    hideFromMenu: true,
    measureBuilderConfig: {
      organisationUnitLevel: 'Facility',
      programCode: FRIDGE_DAILY,
    },
  });

  return insertObject(db, 'mapOverlay', {
    ...mapOverlayBase,
    id: BREACH_LAST_30_DAYS,
    name: 'Breaches x Stock on Hand',
    dataElementCode: BREACH_LAST_30_DAYS,
    displayType: 'color',
    hideFromMenu: false,
    linkedMeasures: `{${FRIDGE_SOH_VALUE}}`,
    values: [
      { value: 0, name: 'No breaches', color: 'blue' },
      { value: 1, name: '1 or more', color: 'red' },
    ],
    measureBuilderConfig: {
      organisationUnitLevel: 'Facility',
    },
  });
};

exports.down = async function(db) {
  await db.runSql(`
    DELETE FROM
      "mapOverlay"
    WHERE
      "id" IN ('${FRIDGE_SOH_VALUE}', '${BREACH_LAST_30_DAYS}');
  `);
};

exports._meta = {
  version: 1,
};
