'use strict';
import {
  medicineElements,
  vaccineElements,
} from './migrationData/20210128033138-AddPreaggregatedDataElements.json';

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

const codes = [
  'BREACH_END_TIME',
  'BREACH_LAST_30_DAYS',
  'BREACH_LAST_48_HOURS',
  'BREACH_MINS',
  'BREACH_SOH_VALUE',
  'BREACH_START_TIME',
  'BREACH_TEMP',
  'FP_Change_Counts_1_New_Acceptors',
  'FP_Change_Counts_2_Change_In_Method_To',
  'FP_Change_Counts_3_Change_In_Method_From',
  'FP_Change_Counts_4_Transfers_In',
  'FP_Change_Counts_5_Transfers_Out',
  'FP_Change_Counts_6_Discontinuation',
  'FP_Method_Counts_A_IUD',
  'FP_Method_Counts_B_Pill_Combined',
  'FP_Method_Counts_C_Pill_Single',
  'FP_Method_Counts_D_Condom_Male',
  'FP_Method_Counts_E_Condom_Female',
  'FP_Method_Counts_F_Natural_Method',
  'FP_Method_Counts_G_Sterilization_Male',
  'FP_Method_Counts_H_Sterilization_Female',
  'FP_Method_Counts_I_Depo_Provera',
  'FP_Method_Counts_J_Jadelle',
  'FP_Method_Counts_K_Other',
  'PercentageCriticalMedicinesAvailable',
  'PercentageCriticalMedicinesExpired',
  'PercentageCriticalMedicinesOutOfStock',
  'POPULATION',
  'PVSH1',
  'PVSH2',
  'PVSH3',
  'PVSH4',
  'TVSH',
  ...medicineElements,
  ...vaccineElements.map(code => `PREAGGREGATED_${code}`),
];

const createRegionalDhisElement = (db, code) =>
  db.runSql(`
    INSERT INTO data_source VALUES(
      generate_object_id(), -- Not using generateId() here since it causes id conflicts
      '${code}',
      'dataElement',
      'dhis',
      '${JSON.stringify({ isDataRegional: true })}'
    )
`);

exports.up = async function (db) {
  await Promise.all(codes.map(async code => createRegionalDhisElement(db, code)));
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
