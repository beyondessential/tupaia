'use strict';

import { insertObject, arrayToDbString } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
const BASE_OVERLAY = {
  groupName: 'Laos Schools',
  userGroup: 'Laos Schools User',
  dataElementCode: 'value',
  displayType: 'color',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  values: [
    { value: 'SchDP_AEAL', color: 'red', name: 'Aide et Action Laos (AEAL)' },
    { value: 'SchDP_CRS', color: 'green', name: 'Catholic Relief Services (CRS)' },
    { value: 'SchDP_HII', color: 'deepPink', name: 'Handicap International' },
    { value: 'SchDP_Plan', color: 'orange', name: 'Plan International' },
    { value: 'SchDP_RtR', color: 'yellow', name: 'Room to Read' },
    { value: 'SchDP_UNICEF', color: 'teal', name: 'UNICEF' },
    { value: 'SchDP_WB', color: 'blue', name: 'World Bank' },
    { value: 'SchDP_WC', color: 'pink', name: 'World Concern Laos' },
    { value: 'SchDP_WFP', color: 'maroon', name: 'World Food Programme (WFP)' },
    { value: 'SchDP_WR', color: 'lime', name: 'World Renew' },
    { value: 'SchDP_WV', color: 'saddleBrown', name: 'World Vision' },
    { value: 'Multiple', color: 'purple', name: 'Multiple' },
    { value: null, color: 'grey', name: 'None' },
  ],
  measureBuilder: 'groupData',
  presentationOptions: {
    displayOnLevel: 'District',
    displayedValueKey: 'originalValue',
    disableRenameLegend: true,
  },
  countryCodes: '{"LA"}',
};

const BASE_CONFIG = {
  groups: {
    SchDP_AEAL: { value: 'Aide et Action Laos (AEAL)', operator: '=' },
    SchDP_CRS: { value: 'Catholic Relief Services (CRS)', operator: '=' },
    SchDP_HII: { value: 'Humanity & Inclusion - Handicap International', operator: '=' },
    SchDP_Plan: { value: 'Plan International', operator: '=' },
    SchDP_RtR: { value: 'Room to Read', operator: '=' },
    SchDP_UNICEF: { value: 'UNICEF', operator: '=' },
    SchDP_WB: { value: 'World Bank', operator: '=' },
    SchDP_WC: { value: 'World Concern Laos', operator: '=' },
    SchDP_WFP: { value: 'World Food Programme (WFP)', operator: '=' },
    SchDP_WR: { value: 'World Renew', operator: '=' },
    SchDP_WV: { value: 'World Vision', operator: '=' },
    Multiple: { value: ', ', operator: 'regex' },
  },
  dataSourceEntityType: 'school',
  aggregationEntityType: 'school',
  measureBuilder: 'getStringsFromBinaryData',
  measureBuilderConfig: {
    dataElementToString: {
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
    },
    dataSourceEntityType: 'school',
    aggregationEntityType: 'school',
  },
};

const OVERLAYS = [
  {
    name: 'Development partners',
    id: 'Laos_Schools_Development_Partners_Pin',
  },
];

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await Promise.all(
    OVERLAYS.map((overlay, index) => {
      const { name, id } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASE_OVERLAY,
        name,
        id,
        measureBuilderConfig: {
          ...BASE_CONFIG,
        },
        sortOrder: index,
      });
    }),
  );
};

exports.down = function (db) {
  return db.runSql(
    `	
    DELETE FROM "mapOverlay" WHERE "id" in (${arrayToDbString(OVERLAYS.map(o => o.id))});	
  `,
  );
};

exports._meta = {
  version: 1,
};
