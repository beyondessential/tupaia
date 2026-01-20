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
  groupName: 'Reproductive Health Commodities (mSupply)',
  userGroup: 'UNFPA',
  dataElementCode: 'value',
  displayType: 'color',
  isDataRegional: true,
  hideFromMenu: false,
  hideFromPopup: false,
  hideFromLegend: false,
  values: [
    { name: '0', color: 'Red', value: '0' },
    { name: '<1 MOS', color: 'Yellow', value: '1' },
    { name: '1-2 MOS', color: 'Green', value: '2' },
    { name: '>2 MOS', color: 'Orange', value: '3' },
  ],
  measureBuilder: 'groupSumDataPerOrgUnit',
  presentationOptions: {
    displayedValueKey: 'originalValue',
    disableRenameLegend: true,
  },
  countryCodes: '{"DL"}',
};

const BASE_CONFIG = {
  groups: {
    0: { value: 0, operator: '=' },
    1: { value: [0, 1], operator: 'rangeExclusive' },
    2: { value: [1, 2], operator: 'range' },
    3: { value: 2, operator: '>' },
  },
  aggregationEntityType: 'facility',
};

const OVERLAYS = [
  {
    name: 'Condoms, male (includes varied styles)',
    id: 'UNFPA_RH_Condoms_male',
    dataElementCodes: ['MOS_3b3444bf', 'MOS_a162942e'],
  },
  { dataElementCodes: ['MOS_bf4be518'], name: 'Condoms, female', id: 'UNFPA_RH_Condoms_female' },
  {
    dataElementCodes: ['MOS_402924bf'],
    name: 'Ethinylestradiol & levonorgestrel 30mcg & 150mcg tablet',
    id: 'UNFPA_RH_Ethinylestradiol_levonorgestrel_30mcg_and_150mcg_tablet',
  },
  {
    dataElementCodes: ['MOS_47d584bf'],
    name: 'Levonorgestrel 30mcg tablet',
    id: 'UNFPA_RH_Levonorgestrel_30mcg_tablet',
  },
  {
    dataElementCodes: ['MOS_3ff944bf'],
    name: 'Etonogestrel-releasing implant',
    id: 'UNFPA_RH_Etonogestrel-releasing_implant',
  },
  {
    dataElementCodes: ['MOS_d2d28620'],
    name: 'Jadelle Contraceptive Implant',
    id: 'UNFPA_RH_Jadelle_Contraceptive_Implant',
  },
  {
    dataElementCodes: ['MOS_47fb04bf'],
    name: 'Levonorgestrel 750mcg tablet (pack of two)',
    id: 'UNFPA_RH_Levonorgestrel_750mcg_tablet_pack_of_two',
  },
  {
    dataElementCodes: ['MOS_47fe44bf'],
    name: 'Levonorgestrel 1.5mg tablet',
    id: 'UNFPA_RH_Levonorgestrel_1500mcg_tablet',
  },
  { dataElementCodes: ['MOS_53d014bf'], name: 'DMPA injection', id: 'UNFPA_RH_DMPA_injection' },
  { dataElementCodes: ['MOS_4752843e'], name: 'SAYANA Press', id: 'UNFPA_RH_SAYANA_Press' },
  {
    dataElementCodes: ['MOS_542a34bf'],
    name: 'Norethisterone amp',
    id: 'UNFPA_RH_Norethisterone_amp',
  },
  {
    dataElementCodes: ['MOS_4718f43e'],
    name: 'Intra Uterine Device',
    id: 'UNFPA_RH_Intra_Uterine_Device',
  },
  {
    dataElementCodes: ['MOS_3b3994bf'],
    name: 'Copper containing device',
    id: 'UNFPA_RH_Copper_containing_device',
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
      const { name, id, dataElementCodes } = overlay;
      return insertObject(db, 'mapOverlay', {
        ...BASE_OVERLAY,
        name,
        id,
        measureBuilderConfig: { ...BASE_CONFIG, dataElementCodes },
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
