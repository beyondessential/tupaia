'use strict';

import { generateId, insertObject, codeToId, nameToId } from '../utilities';

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

const getReport = (reportCode, dataElements) => {
  const aggregations = [
    {
      type: 'FINAL_EACH_DAY',
      config: {
        dataSourceEntityType: 'sub_district',
      },
    },
  ];

  const districtAggregationConfig = {
    type: 'SUM_PER_ORG_GROUP',
    config: {
      dataSourceEntityType: 'sub_district',
      aggregationEntityType: 'district',
    },
  };

  const subDistrictAggregationConfig = {
    type: 'SUM',
  };

  if (reportCode.includes('SubDistrict')) {
    aggregations.push(subDistrictAggregationConfig);
  } else if (reportCode.includes('District')) {
    aggregations.push(districtAggregationConfig);
  }

  return {
    code: reportCode,
    config: {
      fetch: {
        dataElements,
        aggregations,
      },
      transform: [
        'keyValueByDataElementName',
        {
          transform: 'mergeRows',
          groupBy: 'organisationUnit',
          using: {
            period: 'exclude',
          },
        },
        {
          where: `=(not exists($${dataElements[0]})) or (not exists($most_recent_FJ_population))`,
          transform: 'excludeRows',
        },
        {
          insert: {
            value: `=min($${dataElements[0]} / $most_recent_FJ_population,1)`,
            organisationUnitCode: '=$organisationUnit',
          },
          exclude: '*',
          transform: 'updateColumns',
        },
      ],
    },
  };
};

const PERMISSION_GROUP = 'Public';

const getMapOverlay = (name, reportCode, code, mapOverlayId) => ({
  id: mapOverlayId,
  code,
  name,
  report_code: reportCode,
  legacy: false,
  permission_group: PERMISSION_GROUP,
  data_services: [{ isDataRegional: true }],
  config: {
    scaleType: 'performance',
    valueType: 'percentage',
    displayType: 'shaded-spectrum',
    scaleBounds: {
      left: {
        max: 0,
        min: 0,
      },
      right: {
        max: 1,
        min: 1,
      },
    },
    measureLevel: reportCode.includes('SubDistrict') ? 'SubDistrict' : 'District',
  },
  country_codes: '{"FJ"}',
  project_codes: '{supplychain_fiji}',
});

const addMapOverlay = async (db, parentCode, config) => {
  const { reportCode, dataElements, code, name, sortOrder } = config;
  const report = getReport(reportCode, dataElements);
  const mapOverlayId = generateId();
  const mapOverlay = getMapOverlay(name, reportCode, code, mapOverlayId);

  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP);
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', parentCode);

  await insertObject(db, 'report', {
    id: generateId(),
    permission_group_id: permissionGroupId,
    ...report,
  });

  await insertObject(db, 'map_overlay', mapOverlay);

  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlayId,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

const MAP_OVERLAYS = [
  {
    parentCode: `COVID19_Vaccine_Fiji`,
    children: [
      {
        reportCode: 'FJ_COVID_TRACKING_Dose_1_SubDistrict_Percentage_Vaccinated_Capped_map',
        code: 'FJ_COVID_TRACKING_Dose_1_SubDistrict_Percentage_Vaccinated_Capped',
        outdatedOverlayId: 'FJ_COVID_TRACKING_Dose_1_SubDistrict_Percentage_Vaccinated',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 1 (Sub-Division)',
        dataElements: ['COVIDVac4', 'most_recent_FJ_population'],
        sortOrder: 3,
      },
      {
        reportCode: `FJ_COVID_TRACKING_Dose_1_District_Percentage_Vaccinated_Capped_map`,
        code: `FJ_COVID_TRACKING_Dose_1_District_Percentage_Vaccinated_Capped`,
        outdatedOverlayId: 'FJ_COVID_TRACKING_Dose_1_District_Percentage_Vaccinated',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 1 (Division)',
        dataElements: ['COVIDVac4', 'most_recent_FJ_population'],
        sortOrder: 4,
      },
      {
        reportCode: `FJ_COVID_TRACKING_Dose_2_SubDistrict_Percentage_Vaccinated_Capped_map`,
        code: `FJ_COVID_TRACKING_Dose_2_SubDistrict_Percentage_Vaccinated_Capped`,
        outdatedOverlayId: 'FJ_COVID_TRACKING_Dose_2_SubDistrict_Percentage_Vaccinated',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 2 (Sub-Division)',
        dataElements: ['COVIDVac8', 'most_recent_FJ_population'],
        sortOrder: 8,
      },
      {
        reportCode: `FJ_COVID_TRACKING_Dose_2_District_Percentage_Vaccinated_Capped_map`,
        code: `FJ_COVID_TRACKING_Dose_2_District_Percentage_Vaccinated_Capped`,
        outdatedOverlayId: 'FJ_COVID_TRACKING_Dose_2_District_Percentage_Vaccinated',
        name: '% of Eligible Population Vaccinated COVID-19 Dose 2 (Division)',
        dataElements: ['COVIDVac8', 'most_recent_FJ_population'],
        sortOrder: 9,
      },
    ],
  },
];

const removeOutdatedMapOverlay = (db, outdatedOverlayId) => {
  return db.runSql(`
    DELETE FROM "map_overlay" WHERE "code" = '${outdatedOverlayId}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${outdatedOverlayId}';
  `);
};

const removeMapOverlay = (db, reportCode) => {
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "map_overlay" WHERE "code" = '${reportCode}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${reportCode}';
  `);
};

exports.up = async function (db) {
  // Add Map Overlays
  for (const { parentCode, children } of MAP_OVERLAYS) {
    for (const config of children) {
      await addMapOverlay(db, parentCode, config);
    }
  }

  // Remove Outdated Map Overlays
  for (const { children } of MAP_OVERLAYS) {
    for (const { outdatedOverlayId } of children) {
      await removeOutdatedMapOverlay(db, outdatedOverlayId);
    }
  }
};

exports.down = async function (db) {
  // Remove Map Overlays
  for (const { children } of MAP_OVERLAYS) {
    for (const { reportCode } of children) {
      await removeMapOverlay(db, reportCode);
    }
  }
};

exports._meta = {
  version: 1,
};
