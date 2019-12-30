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

function getKeyAndValueArrays(data) {
  const keys = Object.keys(data);
  const values = keys.map(k => data[k]);
  return [keys, values];
}

exports.up = function(db) {
  const [keys, values] = getKeyAndValueArrays({
    name: 'Water purification coloring',
    userGroup: 'Donor',
    groupName: '',
    dataElementCode: 'DP70',
    displayType: 'color',
    values: JSON.stringify([
      { value: 'other', name: 'Has tablets', color: 'blue' },
      { value: 0, name: 'No tablets', color: 'red' },
    ]),
    hideFromPopup: true,
    hideFromMenu: true,
  });

  return db
    .insert('mapOverlay', keys, values, () => null)
    .then(() =>
      db.runSql(`
    UPDATE "mapOverlay"
      SET "linkedMeasures" = ARRAY[(
        SELECT id FROM "mapOverlay" WHERE name='Water purification coloring'
      )]
      WHERE "name" = 'Water purifying tablets available';
  `),
    );
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
