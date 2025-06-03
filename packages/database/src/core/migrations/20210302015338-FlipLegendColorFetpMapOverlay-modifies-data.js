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

const mapOverlayId = {
  district: 'FETP_Active_Graduates_By_District',
  province: 'FETP_Active_Graduates_By_Province',
};
const previousConfig = {
  district: {
    measureBuilderConfig: {
      dataValues: {
        FETPNG20Data_034: '*',
      },
      programCode: 'FGDS',
      dataSourceType: 'custom',
      entityAggregation: {
        aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
        dataSourceEntityType: 'individual',
        aggregationEntityType: 'sub_district',
      },
    },
    presentationOptions: {
      scaleType: 'performanceDesc',
      valueType: 'number',
      displayType: 'shaded-spectrum',
      scaleBounds: {
        left: {
          max: 0,
        },
      },
      measureLevel: 'SubDistrict',
    },
    measureBuilder: 'countEventsPerOrgUnit',
    mapOverlayId: mapOverlayId.district,
  },
  province: {
    measureBuilderConfig: {
      dataValues: {
        FETPNG20Data_033: '*',
      },
      programCode: 'FGDS',
      dataSourceType: 'custom',
      entityAggregation: {
        aggregationType: 'REPLACE_ORG_UNIT_WITH_ORG_GROUP',
        dataSourceEntityType: 'individual',
        aggregationEntityType: 'district',
      },
    },
    presentationOptions: {
      scaleType: 'performanceDesc',
      valueType: 'number',
      displayType: 'shaded-spectrum',
      scaleBounds: {
        left: {
          max: 0,
        },
      },
      measureLevel: 'District',
    },
    measureBuilder: 'countEventsPerOrgUnit',
    mapOverlayId: mapOverlayId.province,
  },
};

const newConfig = {
  district: {
    measureBuilderConfig: {
      groups: {
        0: {
          value: 0,
          operator: '=',
        },
        '>=5': {
          value: 5,
          operator: '>=',
        },
        '1-2': {
          value: [1, 2],
          operator: 'range',
        },
        '3-4': {
          value: [3, 4],
          operator: 'range',
        },
      },
      measureBuilder: 'countEventsPerOrgUnit',
      measureBuilderConfig: previousConfig.district.measureBuilderConfig,
    },
    presentationOptions: {
      values: [
        {
          name: '0',
          color: 'Red',
          value: ['0', 'null'],
        },
        {
          name: '1-2',
          color: 'Orange',
          value: '1-2',
        },
        {
          name: '3-4',
          color: 'Yellow',
          value: '3-4',
        },
        {
          name: '⩾5',
          color: 'Green',
          value: '>=5',
        },
      ],
      displayType: 'shading',
      measureLevel: 'SubDistrict',
      displayedValueKey: 'originalValue',
      disableRenameLegend: true,
    },
    measureBuilder: 'groupData',
    mapOverlayId: mapOverlayId.district,
  },
  province: {
    measureBuilderConfig: {
      groups: {
        0: {
          value: 0,
          operator: '=',
        },
        '>=5': {
          value: 5,
          operator: '>=',
        },
        '1-2': {
          value: [1, 2],
          operator: 'range',
        },
        '3-4': {
          value: [3, 4],
          operator: 'range',
        },
      },
      measureBuilder: 'countEventsPerOrgUnit',
      measureBuilderConfig: previousConfig.province.measureBuilderConfig,
    },
    presentationOptions: {
      values: [
        {
          name: '0',
          color: 'Red',
          value: ['0', 'null'],
        },
        {
          name: '1-2',
          color: 'Orange',
          value: '1-2',
        },
        {
          name: '3-4',
          color: 'Yellow',
          value: '3-4',
        },
        {
          name: '⩾5',
          color: 'Green',
          value: '>=5',
        },
      ],
      displayType: 'shading',
      measureLevel: 'District',
      displayedValueKey: 'originalValue',
      disableRenameLegend: true,
    },
    measureBuilder: 'groupData',
    mapOverlayId: mapOverlayId.province,
  },
};
const modifyMapOverlay = async (db, config) => {
  for (const mapOverlay of Object.values(config)) {
    await db.runSql(`
  UPDATE "mapOverlay"
  SET "measureBuilderConfig" = '${JSON.stringify(mapOverlay.measureBuilderConfig)}' ::jsonb,
      "presentationOptions" = '${JSON.stringify(mapOverlay.presentationOptions)}' ::jsonb,
      "measureBuilder" = '${mapOverlay.measureBuilder}'
  WHERE id = '${mapOverlay.mapOverlayId}'
`);
  }
};

exports.up = async function (db) {
  await modifyMapOverlay(db, newConfig);
};

exports.down = async function (db) {
  await modifyMapOverlay(db, previousConfig);
};

exports._meta = {
  version: 1,
};
