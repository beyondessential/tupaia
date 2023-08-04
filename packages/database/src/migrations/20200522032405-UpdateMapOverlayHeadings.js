'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const CHANGES_TO_MAKE_BY_OVERLAY = {
  Laos_Schools_Children_Supported_With_Learning_Materials: {
    sortOrder: 1,
  },
  Laos_Schools_Children_Supported_With_TV_Programmes_Radio: {
    sortOrder: 2,
  },
  Laos_Schools_Children_Provided_Psychosocial_Support: {
    sortOrder: 3,
  },
  Laos_Schools_Total_Students: {
    sortOrder: 4,
  },
  Laos_Schools_Female_Students: {
    sortOrder: 5,
  },
  Laos_Schools_Male_Students: {
    sortOrder: 6,
  },
};

const REVERSE_CHANGES_TO_MAKE_BY_OVERLAY = {
  Laos_Schools_Children_Supported_With_Learning_Materials: {
    sortOrder: 1,
  },
  Laos_Schools_Children_Supported_With_TV_Programmes_Radio: {
    sortOrder: 0,
  },
  Laos_Schools_Children_Provided_Psychosocial_Support: {
    sortOrder: 2,
  },
  Laos_Schools_Total_Students: {
    sortOrder: 0,
  },
  Laos_Schools_Female_Students: {
    sortOrder: 1,
  },
  Laos_Schools_Male_Students: {
    sortOrder: 2,
  },
};

const OLD_MAP_OVERLAY_GROUP = 'Laos Schools';

const NEW_MAP_OVERLAY_GROUP = 'School Indicators';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return Promise.all([
    Object.entries(CHANGES_TO_MAKE_BY_OVERLAY).map(([overlayId, changes]) =>
      Promise.all(
        Object.entries(changes).map(([columnName, newValue]) =>
          db.runSql(`
            update "mapOverlay"
            set "${columnName}" = '${newValue}'
            where id='${overlayId}';
          `),
        ),
      ),
    ),
    db.runSql(`
      update "mapOverlay"
      set "groupName" = '${NEW_MAP_OVERLAY_GROUP}'
      where "groupName" ='${OLD_MAP_OVERLAY_GROUP}';
    `),
  ]);
};

exports.down = function (db) {
  return Promise.all([
    Object.entries(REVERSE_CHANGES_TO_MAKE_BY_OVERLAY).map(([overlayId, changes]) =>
      Promise.all(
        Object.entries(changes).map(([columnName, newValue]) =>
          db.runSql(`
            update "mapOverlay"
            set "${columnName}" ='${newValue}'
            where id='${overlayId}';
          `),
        ),
      ),
    ),
    db.runSql(`
      update "mapOverlay"
      set "groupName" = '${OLD_MAP_OVERLAY_GROUP}'
      where "groupName" ='${NEW_MAP_OVERLAY_GROUP}';
    `),
  ]);
};

exports._meta = {
  version: 1,
};
