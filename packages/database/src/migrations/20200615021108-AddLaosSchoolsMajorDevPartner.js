'use strict';

import { insertObject, arrayToDbString } from '../utilities';

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

const MAP_OVERLAY_ID_NATIONAL = 'Laos_Schools_Major_Dev_Partner_National';
const MAP_OVERLAY_ID_PROVINCIAL = 'Laos_Schools_Major_Dev_Partner_Provincial';
const MAP_OVERLAY_NAME = 'Major Development Partner';
const GROUP_NAME = 'School Indicators';
// this groups below may be need for #599
// const PROVINCE_GROUP_NAME = 'School Indicators by Province';
// const DISTRICT_GROUP_NAME = 'School Indicators by District';

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

const DATA_ELEMENT_CODES = VALUES.map(data => data.value);

const GROUPS = {
  'Aide et Action Laos (AEAL)': { value: 'SchDP_AEAL', operator: '=' },
  'Catholic Relief Services (CRS)': { value: 'SchDP_CRS', operator: '=' },
  'Humanity & Inclusion - Handicap International': { value: 'SchDP_HII', operator: '=' },
  'Plan International': { value: 'SchDP_Plan', operator: '=' },
  'Room to Read': { value: 'SchDP_RtR', operator: '=' },
  'UNICEF': { value: 'SchDP_UNICEF', operator: '=' },
  'World Bank': { value: 'SchDP_WB', operator: '=' },
  'World Concern Laos': { value: 'SchDP_WC', operator: '=' },
  'World Food Programme (WFP)': { value: 'SchDP_WFP', operator: '=' },
  'World Renew': { value: 'SchDP_WR', operator: '=' },
  'World Vision': { value: 'SchDP_WV', operator: '=' },
};

const DATA_ELEMENTS = {
  SchDP_AEAL: 'Aide et Action Laos (AEAL)',
  SchDP_CRS: 'Catholic Relief Services (CRS)',
  SchDP_HII: 'Humanity & Inclusion - Handicap International',
  SchDP_Plan: 'Plan International',
  SchDP_RtR: 'Room to Read',
  SchDP_UNICEF: 'UNICEF',
  SchDP_WB: 'World Bank',
  SchDP_WC: 'World Concern Laos',
  SchDP_WFP: 'World Food Programme (WFP)',
  SchDP_WR: 'World Renew',
  SchDP_WV: 'World Vision',
};

const MEASURE_BUILDER_CONFIG_NAT = {
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

const MEASURE_BUILDER_CONFIG_PROV = {
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

const PRESENTATION_OPTIONS_NAT = {
  ...PRESENTATION_OPTIONS,
  displayOnLevel: 'Country',
  measureLevel: 'District',
};

const PRESENTATION_OPTIONS_PROV = {
  ...PRESENTATION_OPTIONS,
  displayOnLevel: 'District',
  measureLevel: 'SubDistrict',
};

const BASE_OVERLAY = {
  name: MAP_OVERLAY_NAME,
  groupName: GROUP_NAME,
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  displayType: 'shading',
  isDataRegional: true,
  values: VALUES,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  measureBuilder: 'groupData',
  countryCodes: '{"LA"}',
  projectCodes: '{"laos_schools"}',
};

const insertOverlay = (db, isProvincial) => {
  return insertObject(db, 'mapOverlay', {
    ...BASE_OVERLAY,
    id: isProvincial ? MAP_OVERLAY_ID_PROVINCIAL : MAP_OVERLAY_ID_NATIONAL,
    measureBuilderConfig: isProvincial ? MEASURE_BUILDER_CONFIG_PROV : MEASURE_BUILDER_CONFIG_NAT,
    presentationOptions: isProvincial ? PRESENTATION_OPTIONS_PROV : PRESENTATION_OPTIONS_NAT,
  });
};

exports.up = async function(db) {
  const nationalOverlay = await insertOverlay(db, false);
  const provincialOverlay = await insertOverlay(db, true);
};

exports.down = function(db) {
  return db.runSql(
    `DELETE FROM "mapOverlay" WHERE "id" IN ('${MAP_OVERLAY_ID_NATIONAL}', '${MAP_OVERLAY_ID_PROVINCIAL}')`,
  );
};

exports._meta = {
  version: 1,
};
