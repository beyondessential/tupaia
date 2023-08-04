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

// prettier-ignore
const MAP_OVERLAY_CONFIGS = [
  {
    id: 'CD_Measles_New_Cases_10kPax_Age_Lt_5',
    newDenominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataElementCodes: ['POP02', 'POP03', 'POP04', 'POP05'],
      },
    },
    oldDenominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataSource: { type: 'single', codes: ['POP02', 'POP03', 'POP04', 'POP05'] },
      },
    },
  },
  {
    id: 'CD_Measles_New_Cases_10kPax_Age_In_5_24',
    newDenominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataElementCodes: ['POP06', 'POP07', 'POP08', 'POP09', 'POP10', 'POP11', 'POP12', 'POP13'],
      },
    },
    oldDenominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataSource: {
          type: 'single',
          codes: ['POP06', 'POP07', 'POP08', 'POP09', 'POP10', 'POP11', 'POP12', 'POP13'],
        },
      },
    },
  },
  {
    id: 'CD_Measles_New_Cases_10kPax_Age_Gte_25',
    newDenominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataElementCodes: [
          'POP14','POP15','POP16','POP17','POP18','POP19',
          'POP20','POP21','POP22','POP23','POP24','POP25',
          'POP26','POP27','POP28','POP29','POP30','POP31',
          'POP32','POP33','POP34','POP35','POP36','POP37',
        ],
      },
    },
    oldDenominator: {
      measureBuilder: 'sumLatestPerOrgUnit',
      measureBuilderConfig: {
        dataSource: {
          type: 'single',
          codes: [
            'POP14','POP15','POP16','POP17','POP18','POP19',
            'POP20','POP21','POP22','POP23','POP24','POP25',
            'POP26','POP27','POP28','POP29','POP30','POP31',
            'POP32','POP33','POP34','POP35','POP36','POP37',
          ],
        },
      },
    },
  },
];

const replaceMeasureBuilderDenominatorConfig = async (db, { id, denominator }) =>
  db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = jsonb_set(
        "measureBuilderConfig",
        '{measureBuilders,denominator}',
        '${JSON.stringify(denominator)}'
      )
    WHERE
      id = '${id}'`);

exports.up = async function (db) {
  await Promise.all(
    MAP_OVERLAY_CONFIGS.map(({ id, newDenominator: denominator }) =>
      replaceMeasureBuilderDenominatorConfig(db, { id, denominator }),
    ),
  );
};

exports.down = async function (db) {
  await Promise.all(
    MAP_OVERLAY_CONFIGS.map(({ id, oldDenominator: denominator }) =>
      replaceMeasureBuilderDenominatorConfig(db, { id, denominator }),
    ),
  );
};

exports._meta = {
  version: 1,
};
