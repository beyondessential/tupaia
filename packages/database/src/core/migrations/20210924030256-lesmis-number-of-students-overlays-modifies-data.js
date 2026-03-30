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
      type: 'FINAL_EACH_YEAR',
      config: {
        dataSourceEntityType: 'school',
        aggregationEntityType: 'requested',
      },
    },
  ];

  if (reportCode.includes('Province')) {
    aggregations.push({
      type: 'SUM_PER_ORG_GROUP',
      config: {
        dataSourceEntityType: 'school',
        aggregationEntityType: 'district',
      },
    });
  } else if (reportCode.includes('District')) {
    aggregations.push({
      type: 'SUM_PER_ORG_GROUP',
      config: {
        dataSourceEntityType: 'school',
        aggregationEntityType: 'sub_district',
      },
    });
  }

  return {
    code: reportCode,
    config: {
      fetch: {
        dataElements,
        aggregations,
      },
      transform: [
        {
          transform: 'updateColumns',
          insert: {
            organisationUnitCode: '=$organisationUnit',
          },
          include: ['period', 'value'],
        },
        {
          transform: 'mergeRows',
          groupBy: ['organisationUnitCode', 'period'],
          using: 'sum',
        },
      ],
    },
  };
};

const PERMISSION_GROUP = 'LESMIS Public';

const getMapOverlay = (name, reportCode) => ({
  countryCodes: '{"LA"}',
  dataElementCode: 'value',
  id: reportCode,
  isDataRegional: true,
  legacy: false,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  name,
  presentationOptions: {
    displayType: 'shaded-spectrum',
    measureLevel: reportCode.includes('Province') ? 'District' : 'SubDistrict',
    name,
    scaleType: 'neutral',
    scaleBounds: {
      left: {
        max: 'auto',
      },
      right: {
        min: 'auto',
      },
    },
    periodGranularity: 'one_year_at_a_time',
    valueType: 'number',
  },
  projectCodes: '{laos_schools}',
  report_code: reportCode,
  userGroup: PERMISSION_GROUP,
});

const getBubbleMapOverlay = (name, reportCode) => ({
  countryCodes: '{"LA"}',
  dataElementCode: 'value',
  id: reportCode,
  isDataRegional: true,
  legacy: false,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  name,
  presentationOptions: {
    displayOnLevel: 'District',
    displayType: 'radius',
    measureLevel: 'School',
    name,
    periodGranularity: 'one_year_at_a_time',
    popupHeaderFormat: '{code}: {name}',
    valueType: 'number',
    values: [
      { color: 'blue', value: 'other' },
      { color: 'grey', value: null },
    ],
  },
  projectCodes: '{laos_schools}',
  report_code: reportCode,
  userGroup: PERMISSION_GROUP,
});

const addMapOverlay = async (db, parentCode, config) => {
  const { reportCode, dataElements, name, sortOrder } = config;
  const report = getReport(reportCode, dataElements);
  const mapOverlay = reportCode.includes('School')
    ? getBubbleMapOverlay(name, reportCode)
    : getMapOverlay(name, reportCode);
  const permissionGroupId = await nameToId(db, 'permission_group', PERMISSION_GROUP);
  await insertObject(db, 'report', {
    id: generateId(),
    permission_group_id: permissionGroupId,
    ...report,
  });
  await insertObject(db, 'mapOverlay', mapOverlay);

  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', parentCode);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlay.id,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

const OVERLAY_CODE = 'LESMIS_number_of_students';

const generateDataElements = suffix => {
  const primary = [1, 2, 3, 4, 5].map(n => `nostu_p${n}_${suffix}`);
  const secondary = [1, 2, 3, 4, 5, 6, 7].map(n => `nostu_s${n}_${suffix}`);
  return [...primary, ...secondary];
};

const MAP_OVERLAYS = [
  {
    parentCode: 'Laos_Schools_Student_Numbers_District_Level_Group',
    children: [
      {
        reportCode: `${OVERLAY_CODE}_District_Total_map`,
        name: 'Total students',
        dataElements: [...generateDataElements('m'), ...generateDataElements('f')],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_District_Female_map`,
        name: 'Female students',
        dataElements: generateDataElements('f'),
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_District_Male_map`,
        name: 'Male students',
        dataElements: generateDataElements('m'),
        sortOrder: 2,
      },
    ],
  },
  {
    parentCode: 'Laos_Schools_Student_Numbers_Provincial_Level_Group',
    children: [
      {
        reportCode: `${OVERLAY_CODE}_Province_Total_map`,
        name: 'Total students',
        dataElements: [...generateDataElements('m'), ...generateDataElements('f')],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_Province_Female_map`,
        name: 'Female students',
        dataElements: generateDataElements('f'),
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_Province_Male_map`,
        name: 'Male students',
        dataElements: generateDataElements('m'),
        sortOrder: 2,
      },
    ],
  },
  {
    parentCode: 'Laos_Schools_Student_Numbers_School_Level_Group',
    children: [
      {
        reportCode: `${OVERLAY_CODE}_School_Total_map`,
        name: 'Total students',
        dataElements: [...generateDataElements('m'), ...generateDataElements('f')],
        sortOrder: 0,
      },
      {
        reportCode: `${OVERLAY_CODE}_School_Female_map`,
        name: 'Female students',
        dataElements: generateDataElements('f'),
        sortOrder: 1,
      },
      {
        reportCode: `${OVERLAY_CODE}_School_Male_map`,
        name: 'Male students',
        dataElements: generateDataElements('m'),
        sortOrder: 2,
      },
    ],
  },
];

exports.up = async function (db) {
  // Add Map Overlays
  for (const { parentCode, children } of MAP_OVERLAYS) {
    for (const config of children) {
      await addMapOverlay(db, parentCode, config);
    }
  }
};

const removeMapOverlay = (db, reportCode) => {
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "mapOverlay" WHERE "id" = '${reportCode}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${reportCode}';
  `);
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
