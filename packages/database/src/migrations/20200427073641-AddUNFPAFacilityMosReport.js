'use strict';

import { insertObject } from '../utilities/migration';

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

const REPORT_BASE = {
  id: 'UNFPA_RH_Products_MOS',
  dataBuilder: 'sumPerMonth',
};

const VIEW_JSON_BASE = {
  name: 'Reproductive Health Stock Status: Months Of Stock (mSupply)',
  type: 'chart',
  chartType: 'line',
  periodGranularity: 'month',
};

const CONFIG_BASE = { periodType: 'month' };

const COLORS = [
  '#FC1D26',
  '#FD9155',
  '#FEDD64',
  '#81D75E',
  '#0F7F3B',
  '#20C2CA',
  '#40B7FC',
  '#0A4EAB',
  '#8C5AFB',
  '#FD6AC4',
  '#D9D9D9',
];

const PRODUCTS = [
  {
    dataElementCodes: ['MOS_3b3444bf', 'MOS_a162942e'],
    name: 'Condoms, male',
    id: 'UNFPA_RH_Condoms_male_MOS',
  },
  {
    dataElementCodes: ['MOS_bf4be518'],
    name: 'Condoms, female',
    id: 'UNFPA_RH_Condoms_female_MOS',
  },
  {
    dataElementCodes: ['MOS_402924bf'],
    name: 'COC',
    id: 'UNFPA_RH_Ethinylestradiol_levonorgestrel_30mcg_and_150mcg_tablet_MOS',
  },
  {
    dataElementCodes: ['MOS_47d584bf'],
    name: 'POP',
    id: 'UNFPA_RH_Levonorgestrel_30mcg_tablet_MOS',
  },
  {
    dataElementCodes: ['MOS_3ff944bf'],
    name: 'Implant',
    id: 'UNFPA_RH_Etonogestrel-releasing_implant_MOS',
  },
  {
    dataElementCodes: ['MOS_d2d28620'],
    name: 'Jadelle',
    id: 'UNFPA_RH_Jadelle_Contraceptive_Implant_MOS',
  },
  {
    dataElementCodes: ['MOS_47fb04bf', 'MOS_47fe44bf'],
    name: 'EC',
    id: 'UNFPA_RH_Levonorgestrel_750mcg_tablet_pack_of_two_MOS',
  },
  {
    dataElementCodes: ['MOS_53d014bf'],
    name: 'DMPA',
    id: 'UNFPA_RH_DMPA_injection_MOS',
  },
  {
    dataElementCodes: ['MOS_4752843e'],
    name: 'SAYANA Press',
    id: 'UNFPA_RH_SAYANA_Press_MOS',
  },
  {
    dataElementCodes: ['MOS_542a34bf'],
    name: 'Norethisterone amp',
    id: 'UNFPA_RH_Norethisterone_amp_MOS',
  },
  {
    dataElementCodes: ['MOS_4718f43e', 'MOS_3b3994bf'],
    name: 'IUD',
    id: 'UNFPA_RH_IUD_MOS',
  },
];

exports.up = async function (db) {
  const chartConfig = {};
  const dataClasses = {};
  PRODUCTS.forEach((product, index) => {
    const { id, name, dataElementCodes } = product;
    chartConfig[id] = {
      label: name,
      stackId: index,
      legendOrder: index,
      color: COLORS[index],
    };
    dataClasses[id] = {
      codes: dataElementCodes,
    };
  });

  const REPORT = {
    ...REPORT_BASE,
    viewJson: { ...VIEW_JSON_BASE, chartConfig },
    dataBuilderConfig: { ...CONFIG_BASE, dataClasses },
  };

  await insertObject(db, 'dashboardReport', REPORT);
};

exports.down = function (db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${REPORT_BASE.id}';
   `);
};

exports._meta = {
  version: 1,
};
