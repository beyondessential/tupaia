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

const OVERLAY_ID = 'Laos_Schools_Development_Partners_Pin';

const OLD_NAME = 'Development partners';
const NEW_NAME = 'Development partner support';

const OLD_MEASURE_BUILDER_CONFIG = {
  groups: {
    Multiple: {
      value: ', ',
      operator: 'regex',
    },
    SchDP_WB: {
      value: 'World Bank',
      operator: '=',
    },
    SchDP_WC: {
      value: 'World Concern Laos',
      operator: '=',
    },
    SchDP_WR: {
      value: 'World Renew',
      operator: '=',
    },
    SchDP_WV: {
      value: 'World Vision',
      operator: '=',
    },
    SchDP_CRS: {
      value: 'Catholic Relief Services (CRS)',
      operator: '=',
    },
    SchDP_HII: {
      value: 'Humanity & Inclusion - Handicap International',
      operator: '=',
    },
    SchDP_RtR: {
      value: 'Room to Read',
      operator: '=',
    },
    SchDP_WFP: {
      value: 'World Food Programme (WFP)',
      operator: '=',
    },
    SchDP_AEAL: {
      value: 'Aide et Action Laos (AEAL)',
      operator: '=',
    },
    SchDP_Plan: {
      value: 'Plan International',
      operator: '=',
    },
    SchDP_UNICEF: {
      value: 'UNICEF',
      operator: '=',
    },
  },
  measureBuilder: 'getStringsFromBinaryData',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
    dataElementToString: {
      SchDP_WB: 'World Bank',
      SchDP_WC: 'World Concern Laos',
      SchDP_WR: 'World Renew',
      SchDP_WV: 'World Vision',
      SchDP_CRS: 'Catholic Relief Services (CRS)',
      SchDP_HII: 'Humanity & Inclusion - Handicap International',
      SchDP_RtR: 'Room to Read',
      SchDP_WFP: 'World Food Programme (WFP)',
      SchDP_AEAL: 'Aide et Action Laos (AEAL)',
      SchDP_Plan: 'Plan International',
      SchDP_UNICEF: 'UNICEF',
    },
  },
};

const NEW_MEASURE_BUILDER_CONFIG = {
  groups: {
    Multiple: {
      value: ', ',
      operator: 'regex',
    },
    SchDP_WB: {
      value: 'World Bank',
      operator: '=',
    },
    SchDP_WC: {
      value: 'World Concern Laos',
      operator: '=',
    },
    SchDP_WR: {
      value: 'World Renew',
      operator: '=',
    },
    SchDP_WV: {
      value: 'World Vision',
      operator: '=',
    },
    SchDP_CRS: {
      value: 'Catholic Relief Services (CRS)',
      operator: '=',
    },
    SchDP_HII: {
      value: 'Humanity & Inclusion - Handicap International',
      operator: '=',
    },
    SchDP_RtR: {
      value: 'Room to Read',
      operator: '=',
    },
    SchDP_WFP: {
      value: 'World Food Programme (WFP)',
      operator: '=',
    },
    SchDP_AEAL: {
      value: 'Aide et Action Laos (AEAL)',
      operator: '=',
    },
    SchDP_Plan: {
      value: 'Plan International',
      operator: '=',
    },
    SchDP_UNICEF: {
      value: 'UNICEF',
      operator: '=',
    },
    /* --- Add 'Other' response ---*/
    SchCVD022l: {
      value: 'Other',
      operator: '=',
    },
    /*----------------------------*/
  },
  measureBuilder: 'getStringsFromBinaryData',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
    dataElementToString: {
      SchDP_WB: 'World Bank',
      SchDP_WC: 'World Concern Laos',
      SchDP_WR: 'World Renew',
      SchDP_WV: 'World Vision',
      SchDP_CRS: 'Catholic Relief Services (CRS)',
      SchDP_HII: 'Humanity & Inclusion - Handicap International',
      SchDP_RtR: 'Room to Read',
      SchDP_WFP: 'World Food Programme (WFP)',
      SchDP_AEAL: 'Aide et Action Laos (AEAL)',
      SchDP_Plan: 'Plan International',
      SchDP_UNICEF: 'UNICEF',
      /* --- Add 'Other' response ---*/
      SchCVD022l: 'Other',
      /*----------------------------*/
    },
  },
};

const OLD_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'Aide et Action Laos (AEAL)',
      color: 'red',
      value: 'SchDP_AEAL',
    },
    {
      name: 'Catholic Relief Services (CRS)',
      color: 'green',
      value: 'SchDP_CRS',
    },
    {
      name: 'Handicap International',
      color: 'deepPink',
      value: 'SchDP_HII',
    },
    {
      name: 'Plan International',
      color: 'orange',
      value: 'SchDP_Plan',
    },
    {
      name: 'Room to Read',
      color: 'yellow',
      value: 'SchDP_RtR',
    },
    {
      name: 'UNICEF',
      color: 'teal',
      value: 'SchDP_UNICEF',
    },
    {
      name: 'World Bank',
      color: 'blue',
      value: 'SchDP_WB',
    },
    {
      name: 'World Concern Laos',
      color: 'pink',
      value: 'SchDP_WC',
    },
    {
      name: 'World Food Programme (WFP)',
      color: 'maroon',
      value: 'SchDP_WFP',
    },
    {
      name: 'World Renew',
      color: 'lime',
      value: 'SchDP_WR',
    },
    {
      name: 'World Vision',
      color: 'saddleBrown',
      value: 'SchDP_WV',
    },
    {
      name: 'Multiple',
      color: 'purple',
      value: 'Multiple',
    },
    {
      name: 'None',
      color: 'grey',
      value: null,
    },
  ],
  displayType: 'color',
  measureLevel: 'School',
  displayOnLevel: 'District',
  displayedValueKey: 'originalValue',
  popupHeaderFormat: '{code}: {name}',
  disableRenameLegend: true,
};

const NEW_PRESENTATION_OPTIONS = {
  values: [
    {
      name: 'Aide et Action Laos (AEAL)',
      color: 'red',
      value: 'SchDP_AEAL',
    },
    {
      name: 'Catholic Relief Services (CRS)',
      color: 'green',
      value: 'SchDP_CRS',
    },
    {
      name: 'Handicap International',
      color: 'deepPink',
      value: 'SchDP_HII',
    },
    {
      name: 'Plan International',
      color: 'orange',
      value: 'SchDP_Plan',
    },
    {
      name: 'Room to Read',
      color: 'yellow',
      value: 'SchDP_RtR',
    },
    {
      name: 'UNICEF',
      color: 'teal',
      value: 'SchDP_UNICEF',
    },
    {
      name: 'World Bank',
      color: 'blue',
      value: 'SchDP_WB',
    },
    {
      name: 'World Concern Laos',
      color: 'pink',
      value: 'SchDP_WC',
    },
    {
      name: 'World Food Programme (WFP)',
      color: 'maroon',
      value: 'SchDP_WFP',
    },
    {
      name: 'World Renew',
      color: 'lime',
      value: 'SchDP_WR',
    },
    {
      name: 'World Vision',
      color: 'saddleBrown',
      value: 'SchDP_WV',
    },
    /* --- Add 'Other' response ---*/
    {
      name: 'Other',
      color: 'navy',
      value: 'SchCVD022l',
    },
    /*----------------------------*/
    {
      name: 'Multiple',
      color: 'purple',
      value: 'Multiple',
    },
    {
      name: 'None',
      color: 'grey',
      value: null,
    },
  ],
  displayType: 'color',
  measureLevel: 'School',
  displayOnLevel: 'District',
  displayedValueKey: 'originalValue',
  popupHeaderFormat: '{code}: {name}',
  disableRenameLegend: true,
};

exports.up = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET name = '${NEW_NAME}',
    "measureBuilderConfig" = '${JSON.stringify(NEW_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(NEW_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "mapOverlay"
    SET name = '${OLD_NAME}',
    "measureBuilderConfig" = '${JSON.stringify(OLD_MEASURE_BUILDER_CONFIG)}',
    "presentationOptions" = '${JSON.stringify(OLD_PRESENTATION_OPTIONS)}'
    WHERE id = '${OVERLAY_ID}';
  `);
};

exports._meta = {
  version: 1,
};
