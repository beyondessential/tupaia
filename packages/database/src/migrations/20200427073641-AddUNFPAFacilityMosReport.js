'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

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

const DASHBOARD_GROUP_CODES = ['DL_Unfpa_Facility']; //not yet a group

const REPORT_BASE = {
  id: 'PG_Strive_PNG_Positive_RDT_By_Result_Over_Time',
  dataBuilder: 'countEventsPerPeriodByDataValue',
};

const VIEW_JSON_BASE = {
  name: 'Reproductive Health Stock Status: Months Of Stock (mSupply)',
  type: 'chart',
  chartType: 'bar',
  periodGranularity: 'month',
};

const PRODUCTS = [
  {
    name: 'Condoms, male',
    id: 'UNFPA_RH_Condoms_male',
    dataElementCodes: ['MOS_3b3444bf'],
  },
  {
    name: 'Condoms, male, varied',
    id: 'UNFPA_RH_Condoms_male_varied',
    dataElementCodes: ['MOS_a162942e'],
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
].map(p => ({ ...p, id: `${p.id}_MOS` }));

exports.up = async function(db) {
  const viewJson = {
    ...VIEW_JSON_BASE,
    chartConfig: PRODUCTS.map((product, index) => {
      const { name } = product;
      return {
        [name]: {
          label: name,
          stackId: index,
          legendOrder: index,
        },
      };
    }),
  };

  const REPORT = { ...REPORT_BASE, viewJson }; //add actual data
  await insertObject(db, 'dashboardReport', REPORT_BASE);

  return db.runSql(`
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = "dashboardReports" || '{ ${REPORT_BASE.id} }'
     WHERE
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
   `);
};

exports.down = function(db) {
  return db.runSql(`
     DELETE FROM "dashboardReport" WHERE id = '${REPORT_BASE.id}';
     UPDATE
       "dashboardGroup"
     SET
       "dashboardReports" = array_remove("dashboardReports", '${REPORT_BASE.id}')
     WHERE
       "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
   `);
};

exports._meta = {
  version: 1,
};
