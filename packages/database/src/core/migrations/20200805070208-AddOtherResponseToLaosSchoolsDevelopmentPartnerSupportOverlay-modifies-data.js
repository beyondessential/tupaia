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

const OLD_PROVINCE_MEASURE_BUILDER_CONFIG = {
  groups: {
    SchDP_WB: {
      value: 'SchDP_WB',
      operator: '=',
    },
    SchDP_WC: {
      value: 'SchDP_WC',
      operator: '=',
    },
    SchDP_WR: {
      value: 'SchDP_WR',
      operator: '=',
    },
    SchDP_WV: {
      value: 'SchDP_WV',
      operator: '=',
    },
    SchDP_CRS: {
      value: 'SchDP_CRS',
      operator: '=',
    },
    SchDP_HII: {
      value: 'SchDP_HII',
      operator: '=',
    },
    SchDP_RtR: {
      value: 'SchDP_RtR',
      operator: '=',
    },
    SchDP_WFP: {
      value: 'SchDP_WFP',
      operator: '=',
    },
    SchDP_AEAL: {
      value: 'SchDP_AEAL',
      operator: '=',
    },
    SchDP_Plan: {
      value: 'SchDP_Plan',
      operator: '=',
    },
    SchDP_UNIC: {
      value: 'SchDP_UNIC',
      operator: '=',
    },
  },
  measureBuilder: 'maxSumPerOrgUnit',
  measureBuilderConfig: {
    dataElementCodes: [
      'SchDP_AEAL',
      'SchDP_CRS',
      'SchDP_HII',
      'SchDP_Plan',
      'SchDP_RtR',
      'SchDP_UNIC',
      'SchDP_WB',
      'SchDP_WC',
      'SchDP_WFP',
      'SchDP_WR',
      'SchDP_WV',
    ],
    entityAggregation: {
      aggregationType: 'SUM_PER_ORG_GROUP',
      aggregationConfig: {
        valueToMatch: 'Yes',
      },
      dataSourceEntityType: 'school',
      aggregationEntityType: 'district',
    },
  },
};

const NEW_PROVINCE_MEASURE_BUILDER_CONFIG = {
  groups: {
    SchDP_WB: {
      value: 'SchDP_WB',
      operator: '=',
    },
    SchDP_WC: {
      value: 'SchDP_WC',
      operator: '=',
    },
    SchDP_WR: {
      value: 'SchDP_WR',
      operator: '=',
    },
    SchDP_WV: {
      value: 'SchDP_WV',
      operator: '=',
    },
    SchDP_CRS: {
      value: 'SchDP_CRS',
      operator: '=',
    },
    SchDP_HII: {
      value: 'SchDP_HII',
      operator: '=',
    },
    SchDP_RtR: {
      value: 'SchDP_RtR',
      operator: '=',
    },
    SchDP_WFP: {
      value: 'SchDP_WFP',
      operator: '=',
    },
    SchDP_AEAL: {
      value: 'SchDP_AEAL',
      operator: '=',
    },
    SchDP_Plan: {
      value: 'SchDP_Plan',
      operator: '=',
    },
    SchDP_UNIC: {
      value: 'SchDP_UNIC',
      operator: '=',
    },
    // New Code
    SchCVD022l: {
      value: 'SchCVD022l',
      operator: '=',
    },
  },
  measureBuilder: 'maxSumPerOrgUnit',
  measureBuilderConfig: {
    dataElementCodes: [
      'SchDP_AEAL',
      'SchDP_CRS',
      'SchDP_HII',
      'SchDP_Plan',
      'SchDP_RtR',
      'SchDP_UNIC',
      'SchDP_WB',
      'SchDP_WC',
      'SchDP_WFP',
      'SchDP_WR',
      'SchDP_WV',
      // New Code
      'SchCVD022l',
    ],
    entityAggregation: {
      aggregationType: 'SUM_PER_ORG_GROUP',
      aggregationConfig: {
        valueToMatch: 'Yes',
      },
      dataSourceEntityType: 'school',
      aggregationEntityType: 'district',
    },
  },
};

const OLD_PROVINCE_PRESENTATION_OPTIONS = {
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
      name: 'Humanity & Inclusion - Handicap International',
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
      value: 'SchDP_UNIC',
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
  ],
  valueType: 'text',
  displayType: 'shading',
  customColors: 'red,green,deepPink,orange,yellow,teal,blue,pink,maroon,lime,saddleBrown',
  measureLevel: 'District',
  displayedValueKey: 'name',
  disableRenameLegend: true,
};

const NEW_PROVINCE_PRESENTATION_OPTIONS = {
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
      name: 'Humanity & Inclusion - Handicap International',
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
      value: 'SchDP_UNIC',
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
    // New Code
    {
      name: 'Other',
      color: 'cyan',
      value: 'SchCVD022l',
    },
  ],
  valueType: 'text',
  displayType: 'shading',
  customColors: 'red,green,deepPink,orange,yellow,teal,blue,pink,maroon,lime,saddleBrown,cyan',
  measureLevel: 'District',
  displayedValueKey: 'name',
  disableRenameLegend: true,
};

const OLD_DISTRICT_MEASURE_BUILDER_CONFIG = {
  groups: {
    SchDP_WB: {
      value: 'SchDP_WB',
      operator: '=',
    },
    SchDP_WC: {
      value: 'SchDP_WC',
      operator: '=',
    },
    SchDP_WR: {
      value: 'SchDP_WR',
      operator: '=',
    },
    SchDP_WV: {
      value: 'SchDP_WV',
      operator: '=',
    },
    SchDP_CRS: {
      value: 'SchDP_CRS',
      operator: '=',
    },
    SchDP_HII: {
      value: 'SchDP_HII',
      operator: '=',
    },
    SchDP_RtR: {
      value: 'SchDP_RtR',
      operator: '=',
    },
    SchDP_WFP: {
      value: 'SchDP_WFP',
      operator: '=',
    },
    SchDP_AEAL: {
      value: 'SchDP_AEAL',
      operator: '=',
    },
    SchDP_Plan: {
      value: 'SchDP_Plan',
      operator: '=',
    },
    SchDP_UNIC: {
      value: 'SchDP_UNIC',
      operator: '=',
    },
  },
  measureBuilder: 'maxSumPerOrgUnit',
  measureBuilderConfig: {
    dataElementCodes: [
      'SchDP_AEAL',
      'SchDP_CRS',
      'SchDP_HII',
      'SchDP_Plan',
      'SchDP_RtR',
      'SchDP_UNIC',
      'SchDP_WB',
      'SchDP_WC',
      'SchDP_WFP',
      'SchDP_WR',
      'SchDP_WV',
    ],
    entityAggregation: {
      aggregationType: 'SUM_PER_ORG_GROUP',
      aggregationConfig: {
        valueToMatch: 'Yes',
      },
      dataSourceEntityType: 'school',
      aggregationEntityType: 'sub_district',
    },
  },
};

const NEW_DISTRICT_MEASURE_BUILDER_CONFIG = {
  groups: {
    SchDP_WB: {
      value: 'SchDP_WB',
      operator: '=',
    },
    SchDP_WC: {
      value: 'SchDP_WC',
      operator: '=',
    },
    SchDP_WR: {
      value: 'SchDP_WR',
      operator: '=',
    },
    SchDP_WV: {
      value: 'SchDP_WV',
      operator: '=',
    },
    SchDP_CRS: {
      value: 'SchDP_CRS',
      operator: '=',
    },
    SchDP_HII: {
      value: 'SchDP_HII',
      operator: '=',
    },
    SchDP_RtR: {
      value: 'SchDP_RtR',
      operator: '=',
    },
    SchDP_WFP: {
      value: 'SchDP_WFP',
      operator: '=',
    },
    SchDP_AEAL: {
      value: 'SchDP_AEAL',
      operator: '=',
    },
    SchDP_Plan: {
      value: 'SchDP_Plan',
      operator: '=',
    },
    SchDP_UNIC: {
      value: 'SchDP_UNIC',
      operator: '=',
    },
    // New Code
    SchCVD022l: {
      value: 'SchCVD022l',
      operator: '=',
    },
  },
  measureBuilder: 'maxSumPerOrgUnit',
  measureBuilderConfig: {
    dataElementCodes: [
      'SchDP_AEAL',
      'SchDP_CRS',
      'SchDP_HII',
      'SchDP_Plan',
      'SchDP_RtR',
      'SchDP_UNIC',
      'SchDP_WB',
      'SchDP_WC',
      'SchDP_WFP',
      'SchDP_WR',
      'SchDP_WV',
      // New Code
      'SchCVD022l',
    ],
    entityAggregation: {
      aggregationType: 'SUM_PER_ORG_GROUP',
      aggregationConfig: {
        valueToMatch: 'Yes',
      },
      dataSourceEntityType: 'school',
      aggregationEntityType: 'sub_district',
    },
  },
};

const OLD_DISTRICT_PRESENTATION_OPTIONS = {
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
      name: 'Humanity & Inclusion - Handicap International',
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
      value: 'SchDP_UNIC',
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
  ],
  valueType: 'text',
  displayType: 'shading',
  customColors: 'red,green,deepPink,orange,yellow,teal,blue,pink,maroon,lime,saddleBrown',
  measureLevel: 'SubDistrict',
  displayedValueKey: 'name',
  disableRenameLegend: true,
};

const NEW_DISTRICT_PRESENTATION_OPTIONS = {
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
      name: 'Humanity & Inclusion - Handicap International',
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
      value: 'SchDP_UNIC',
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
    // New Code
    {
      name: 'Other',
      color: 'cyan',
      value: 'SchCVD022l',
    },
  ],
  valueType: 'text',
  displayType: 'shading',
  customColors: 'red,green,deepPink,orange,yellow,teal,blue,pink,maroon,lime,saddleBrown,cyan',
  measureLevel: 'SubDistrict',
  displayedValueKey: 'name',
  disableRenameLegend: true,
};

const DISTRICT_OVERLAY = {
  id: 'Laos_Schools_Major_Dev_Partner_District',
  oldMeasureBuilderConfig: OLD_DISTRICT_MEASURE_BUILDER_CONFIG,
  newMeasureBuilderConfig: NEW_DISTRICT_MEASURE_BUILDER_CONFIG,
  oldPresentationOptions: OLD_DISTRICT_PRESENTATION_OPTIONS,
  newPresentationOptions: NEW_DISTRICT_PRESENTATION_OPTIONS,
};

const PROVINCE_OVERLAY = {
  id: 'Laos_Schools_Major_Dev_Partner_Province',
  oldMeasureBuilderConfig: OLD_PROVINCE_MEASURE_BUILDER_CONFIG,
  newMeasureBuilderConfig: NEW_PROVINCE_MEASURE_BUILDER_CONFIG,
  oldPresentationOptions: OLD_PROVINCE_PRESENTATION_OPTIONS,
  newPresentationOptions: NEW_PROVINCE_PRESENTATION_OPTIONS,
};

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(DISTRICT_OVERLAY.newMeasureBuilderConfig)}',
    "presentationOptions" = '${JSON.stringify(DISTRICT_OVERLAY.newPresentationOptions)}'
    WHERE id = '${DISTRICT_OVERLAY.id}';

    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(PROVINCE_OVERLAY.newMeasureBuilderConfig)}',
    "presentationOptions" = '${JSON.stringify(PROVINCE_OVERLAY.newPresentationOptions)}'
    WHERE id = '${PROVINCE_OVERLAY.id}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(DISTRICT_OVERLAY.oldMeasureBuilderConfig)}',
    "presentationOptions" = '${JSON.stringify(DISTRICT_OVERLAY.oldPresentationOptions)}'
    WHERE id = '${DISTRICT_OVERLAY.id}';

    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(PROVINCE_OVERLAY.oldMeasureBuilderConfig)}',
    "presentationOptions" = '${JSON.stringify(PROVINCE_OVERLAY.oldPresentationOptions)}'
    WHERE id = '${PROVINCE_OVERLAY.id}';
  `);
};

exports._meta = {
  version: 1,
};
