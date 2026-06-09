'use strict';

import { insertObject } from '../utilities';

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

const MAP_OVERLAY_ID_PROVINCE = 'Laos_Schools_Major_Dev_Partner_Province';
const MAP_OVERLAY_ID_DISTRICT = 'Laos_Schools_Major_Dev_Partner_District';
const MAP_OVERLAY_NAME = 'Major Development Partner';
const PROVINCE_GROUP_NAME = 'School Indicators by Province';
const DISTRICT_GROUP_NAME = 'School Indicators by District';

const VALUES = [
  { value: 'SchDP_AEAL', name: 'Aide et Action Laos (AEAL)', color: 'red' },
  { value: 'SchDP_CRS', name: 'Catholic Relief Services (CRS)', color: 'green' },
  { value: 'SchDP_HII', name: 'Humanity & Inclusion - Handicap International', color: 'deepPink' },
  { value: 'SchDP_Plan', name: 'Plan International', color: 'orange' },
  { value: 'SchDP_RtR', name: 'Room to Read', color: 'yellow' },
  { value: 'SchDP_UNIC', name: 'UNICEF', color: 'teal' },
  { value: 'SchDP_WB', name: 'World Bank', color: 'blue' },
  { value: 'SchDP_WC', name: 'World Concern Laos', color: 'pink' },
  { value: 'SchDP_WFP', name: 'World Food Programme (WFP)', color: 'maroon' },
  { value: 'SchDP_WR', name: 'World Renew', color: 'lime' },
  { value: 'SchDP_WV', name: 'World Vision', color: 'saddleBrown' },
];

const GROUPS = {
  SchDP_AEAL: { value: 'SchDP_AEAL', operator: '=' },
  SchDP_CRS: { value: 'SchDP_CRS', operator: '=' },
  SchDP_HII: { value: 'SchDP_HII', operator: '=' },
  SchDP_Plan: { value: 'SchDP_Plan', operator: '=' },
  SchDP_RtR: { value: 'SchDP_RtR', operator: '=' },
  SchDP_UNIC: { value: 'SchDP_UNIC', operator: '=' },
  SchDP_WB: { value: 'SchDP_WB', operator: '=' },
  SchDP_WC: { value: 'SchDP_WC', operator: '=' },
  SchDP_WFP: { value: 'SchDP_WFP', operator: '=' },
  SchDP_WR: { value: 'SchDP_WR', operator: '=' },
  SchDP_WV: { value: 'SchDP_WV', operator: '=' },
};

const DATA_ELEMENTS = {
  SchDP_AEAL: 'Aide et Action Laos (AEAL)',
  SchDP_CRS: 'Catholic Relief Services (CRS)',
  SchDP_HII: 'Humanity & Inclusion - Handicap International',
  SchDP_Plan: 'Plan International',
  SchDP_RtR: 'Room to Read',
  SchDP_UNIC: 'UNICEF',
  SchDP_WB: 'World Bank',
  SchDP_WC: 'World Concern Laos',
  SchDP_WFP: 'World Food Programme (WFP)',
  SchDP_WR: 'World Renew',
  SchDP_WV: 'World Vision',
};

const DATA_ELEMENT_CODES = Object.keys(DATA_ELEMENTS);

const MEASURE_BUILDER_CONFIG_PROV = {
  measureBuilder: 'maxSumPerOrgUnit',
  groups: GROUPS,
  measureBuilderConfig: {
    entityAggregation: {
      aggregationEntityType: 'district',
      dataSourceEntityType: 'school',
      aggregationType: 'SUM_PER_ORG_GROUP',
      aggregationConfig: {
        valueToMatch: 'Yes',
      },
    },
    dataElementCodes: DATA_ELEMENT_CODES,
  },
};

const MEASURE_BUILDER_CONFIG_DIST = {
  measureBuilder: 'maxSumPerOrgUnit',
  groups: GROUPS,
  measureBuilderConfig: {
    entityAggregation: {
      aggregationEntityType: 'sub_district',
      dataSourceEntityType: 'school',
      aggregationType: 'SUM_PER_ORG_GROUP',
      aggregationConfig: {
        valueToMatch: 'Yes',
      },
    },
    dataElementCodes: DATA_ELEMENT_CODES,
  },
};

const PRESENTATION_OPTIONS = {
  displayedValueKey: 'name',
  valueType: 'text',
  disableRenameLegend: true,
};

const PRESENTATION_OPTIONS_PROV = {
  ...PRESENTATION_OPTIONS,
  measureLevel: 'District',
};

const PRESENTATION_OPTIONS_DIST = {
  ...PRESENTATION_OPTIONS,
  measureLevel: 'SubDistrict',
};

const BASE_OVERLAY = {
  name: MAP_OVERLAY_NAME,
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  displayType: 'shading',
  customColors: VALUES.map(v => v.color).join(','),
  isDataRegional: true,
  values: VALUES,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  measureBuilder: 'groupData',
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_schools"}',
};

const insertOverlay = (db, isDistrictLevel) => {
  return insertObject(db, 'mapOverlay', {
    ...BASE_OVERLAY,
    id: isDistrictLevel ? MAP_OVERLAY_ID_DISTRICT : MAP_OVERLAY_ID_PROVINCE,
    groupName: isDistrictLevel ? DISTRICT_GROUP_NAME : PROVINCE_GROUP_NAME,
    measureBuilderConfig: isDistrictLevel
      ? MEASURE_BUILDER_CONFIG_DIST
      : MEASURE_BUILDER_CONFIG_PROV,
    presentationOptions: isDistrictLevel ? PRESENTATION_OPTIONS_DIST : PRESENTATION_OPTIONS_PROV,
  });
};

exports.up = async function (db) {
  const provinceOverlay = await insertOverlay(db, false);
  const districtOverlay = await insertOverlay(db, true);
};

exports.down = function (db) {
  return db.runSql(
    `DELETE FROM "mapOverlay" WHERE "id" IN ('${MAP_OVERLAY_ID_PROVINCE}', '${MAP_OVERLAY_ID_DISTRICT}')`,
  );
};

exports._meta = {
  version: 1,
};
