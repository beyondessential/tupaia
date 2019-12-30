'use strict';

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

const facilityStatusValues = JSON.stringify([
  { name: 'Open', value: ['0', '1'], icon: 'circle' },
  { name: 'Temporarily closed', value: '2', icon: 'x' },
  { name: 'Permanently closed', value: '3', icon: 'triangle' },
  { name: 'No data', value: 'null', icon: 'empty' },
]);

const inserts = [
  {
    name: 'Facility type',
    userGroup: 'Public',
    groupName: '',
    dataElementCode: 'facilityTypeCode',
    displayType: 'color',
    values: JSON.stringify([
      { value: 1, name: 'Hospital', color: 'yellow' },
      { value: 2, name: 'Community health centre', color: 'teal' },
      { value: 3, name: 'Clinic', color: 'green' },
      { value: 4, name: 'Aid post', color: 'orange' },
      { value: 'other', name: 'Other', color: 'purple' },
    ]),
    hideFromPopup: false,
    hideFromMenu: true,
  },
  {
    name: 'Inpatient beds coloring',
    userGroup: 'Public',
    groupName: '',
    dataElementCode: 'SS1',
    displayType: 'color',
    values: JSON.stringify([
      { value: 'other', name: 'Has beds', color: 'blue' },
      { value: 0, name: 'No beds', color: 'red' },
    ]),
    hideFromPopup: true,
    hideFromMenu: true,
  },
];

const insertKeys = Object.keys(inserts[0]);
const insertNames = inserts.map(data => `'${data.name}'`);

const rejectOnError = (resolve, reject, error) => {
  if (error) {
    reject(error);
  } else {
    resolve();
  }
};

exports.up = function(db) {
  return db
    .runSql(
      `
    ALTER TABLE "mapOverlay"
      ADD COLUMN "values" JSONB,
      ADD COLUMN "hideFromMenu" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN "hideFromPopup" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN "hideFromLegend" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN "linkedMeasures" INT [];

    -- add values to existing measures
    UPDATE "mapOverlay"
      SET
        "values" = '${facilityStatusValues}',
        "displayType" = 'icon'
      WHERE "id" = 126;
  `,
    )
    .then(() => {
      // insert new secondary measures
      return Promise.all(
        inserts.map(
          data =>
            new Promise((resolve, reject) => {
              db.insert('mapOverlay', insertKeys, insertKeys.map(k => data[k]), error =>
                rejectOnError(resolve, reject, error),
              );
            }),
        ),
      );
    })
    .then(() => {
      // add relations to new secondary measures
      return db.runSql(`
      UPDATE "mapOverlay"
        SET "linkedMeasures" = ARRAY[(
          SELECT id FROM "mapOverlay" WHERE name='Facility type'
        )]
        WHERE "name" = 'Operational facilities';

      UPDATE "mapOverlay"
        SET "linkedMeasures" = ARRAY[(
          SELECT id FROM "mapOverlay" WHERE name='Inpatient beds coloring'
        )]
        WHERE "name" = 'Inpatient beds';
    `);
    });
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE "mapOverlay"
      DROP COLUMN "values",
      DROP COLUMN "hideFromMenu",
      DROP COLUMN "hideFromPopup",
      DROP COLUMN "hideFromLegend",
      DROP COLUMN "linkedMeasures";

    DELETE FROM "mapOverlay"
      WHERE "name" IN (${insertNames.join(',')});
  `);
};

exports._meta = {
  version: 1,
};
