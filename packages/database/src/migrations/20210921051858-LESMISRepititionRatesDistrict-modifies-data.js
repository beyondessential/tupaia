'use strict';

import { insertObject, generateId } from '../utilities';

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

const PERMISSION_GROUP = 'LESMIS Public';
const DISTRICT_OVERLAY_GROUP_ID = '5f2c7ddc61f76a513a000215';

const getOverlayNames = (gradeNum, educationLevel, GPI) => {
  if (gradeNum !== null) {
    return {
      name: `Grade ${educationLevel === 'p' ? gradeNum : gradeNum + 5} Repetition Rate ${
        GPI ? 'GPI' : ''
      }`,
      dataElement: [
        `rr_district_${educationLevel.concat(gradeNum)}_${GPI ? 'f' : 't'}`,
        `${GPI ? 'rr_district_s1_m' : ''}`,
      ],
      reportCode: `LESMIS_grade_${
        educationLevel === 'p' ? gradeNum : gradeNum + 5
      }_repetition_rate_${GPI ? 'GPI' : ''}_district_map`,
    };
  }
  const educationLevelTranslation = {
    pe: 'Primary',
    lse: 'Lower Secondary',
    use: 'Upper Secondary',
  };
  return {
    name: `${educationLevelTranslation[educationLevel]} Repetition Rate`,
    dataElement: [`rr_district_${educationLevel}_t`],
    reportCode: `LESMIS_${educationLevelTranslation[educationLevel]
      .toLowerCase()
      .split(' ')
      .join('')}_repetition_rate_district_map`,
  };
};

const getReport = (reportCode, dataElement) => ({
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataElements: dataElement,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          organisationUnitCode: '=$organisationUnit',
          value: '=$value',
        },
        exclude: ['organisationUnit', 'dataElement', 'period'],
      },
    ],
  },
});

const getGpiReport = (reportCode, dataElement) => ({
  id: generateId(),
  code: reportCode,
  config: {
    fetch: {
      dataElements: dataElement,
      aggregations: [
        {
          type: 'FINAL_EACH_YEAR',
          config: {
            dataSourceEntityType: 'sub_district',
            aggregationEntityType: 'requested',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'updateColumns',
        insert: {
          organisationUnitCode: '=$organisationUnit',
          '=$dataElement': '=divide($value, 100)',
        },
        exclude: ['dataElement', 'value', 'organisationUnit'],
      },
      {
        transform: 'mergeRows',
        groupBy: ['organisationUnitCode', 'period'],
        using: 'single',
      },
      {
        transform: 'updateColumns',
        insert: {
          value: `=divide($${dataElement[0]},$${dataElement[1]})`,
        },
        exclude: [dataElement[0], dataElement[1]],
      },
    ],
  },
});

const getMapOverlay = (name, reportCode) => ({
  id: reportCode,
  name,
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  legacy: false,
  report_code: reportCode,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
    scaleType: 'performanceDesc',
    displayType: 'shaded-spectrum',
    measureLevel: 'SubDistrict',
    valueType: 'percentage',
    scaleBounds: {
      left: {
        max: 'auto',
      },
      right: {
        min: 'auto',
      },
    },
    periodGranularity: 'one_year_at_a_time',
  },
  countryCodes: '{"LA"}',
  projectCodes: '{laos_schools}',
});

const getGpiMapOverlay = (name, reportCode) => ({
  id: reportCode,
  name,
  userGroup: PERMISSION_GROUP,
  dataElementCode: 'value',
  isDataRegional: true,
  legacy: false,
  report_code: reportCode,
  measureBuilder: 'useReportServer',
  measureBuilderConfig: {
    dataSourceType: 'custom',
    reportCode,
  },
  presentationOptions: {
    scaleType: 'gpi',
    displayType: 'shaded-spectrum',
    measureLevel: 'SubDistrict',
    scaleBounds: {
      left: {
        max: 0,
      },
      right: {
        min: 2,
      },
    },
    periodGranularity: 'one_year_at_a_time',
  },
  countryCodes: '{"LA"}',
  projectCodes: '{laos_schools}',
});

const getPermissionGroupId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const getSpecificReport = (reportCode, dataElement, GPI) =>
  GPI ? getGpiReport(reportCode, dataElement) : getReport(reportCode, dataElement);

const getSpecificMapOverlay = (name, reportCode, GPI) =>
  GPI ? getGpiMapOverlay(name, reportCode) : getMapOverlay(name, reportCode);

const addMapOverlay = async (db, gradeNum, educationLevel, sortOrder, GPI) => {
  const { name, dataElement, reportCode } = getOverlayNames(gradeNum, educationLevel, GPI);
  const mapOverlayGroupId = DISTRICT_OVERLAY_GROUP_ID;
  const report = getSpecificReport(reportCode, dataElement, GPI);
  const mapOverlay = getSpecificMapOverlay(name, reportCode, GPI);
  const permissionGroupId = await getPermissionGroupId(db, PERMISSION_GROUP);
  await insertObject(db, 'report', { ...report, permission_group_id: permissionGroupId });
  await insertObject(db, 'mapOverlay', mapOverlay);
  return insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: mapOverlay.id,
    child_type: 'mapOverlay',
    sort_order: sortOrder,
  });
};

const removeMapOverlay = (db, gradeNum, educationLevel, GPI) => {
  const { reportCode } = getOverlayNames(gradeNum, educationLevel, GPI);
  return db.runSql(`
    DELETE FROM "report" WHERE code = '${reportCode}';
    DELETE FROM "mapOverlay" WHERE "id" = '${reportCode}';
    DELETE FROM "map_overlay_group_relation" WHERE "child_id" = '${reportCode}';
  `);
};

exports.up = async function (db) {
  // Add Primary Overlays
  for (let i = 1; i < 6; i++) {
    addMapOverlay(db, i, 'p', i - 1, false);
  }

  // Add Secondary Overlays
  for (let i = 1; i < 8; i++) {
    addMapOverlay(db, i, 's', i + 5, false);
  }

  // Add primary, secondary overlays
  addMapOverlay(db, null, 'pe', 13, false);
  addMapOverlay(db, null, 'lse', 14, false);
  addMapOverlay(db, null, 'use', 15, false);

  // Add Grade 6 rate GPI overlay
  addMapOverlay(db, 1, 's', 6, true);
};

exports.down = async function (db) {
  // Remove primary overlays
  for (let i = 1; i < 6; i++) {
    removeMapOverlay(db, i, 'p', false);
  }
  // Remove secondary overlays
  for (let i = 1; i < 8; i++) {
    removeMapOverlay(db, i, 's', false);
  }

  // Remove primary, secondary overlays
  removeMapOverlay(db, null, 'pe', false);
  removeMapOverlay(db, null, 'lse', false);
  removeMapOverlay(db, null, 'use', false);

  // Remove Grade 6 rate GPI overlay
  removeMapOverlay(db, 1, 's', true);
};

exports._meta = {
  version: 1,
};
