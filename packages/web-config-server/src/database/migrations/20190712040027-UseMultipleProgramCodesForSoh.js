'use strict';

import { updateValues } from '../migrationUtilities';

var dbm;
var type;
var seed;

const NEW_PROGRAM_CODES = ['FRIDGE_BREACH', 'FRIDGE_DAILY'];
const OLD_PROGRAM_CODE = 'FRIDGE_DAILY';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await updateValues(
    db,
    'dashboardReport',
    {
      dataBuilderConfig: {
        dataSource: {
          type: 'single',
          codes: [
            'DOSES_375874bf',
            'DOSES_44ec84bf',
            'DOSES_7191781d',
            'DOSES_6fc9d81d',
            'DOSES_cd2d581d',
            'DOSES_4e6a681d',
            'DOSES_40a8681d',
            'DOSES_452a74bf',
          ],
          programCodes: NEW_PROGRAM_CODES,
        },
        columnTitle: 'Stock Count',
      },
    },
    { id: 'Imms_FridgeVaccineCount' },
  );

  return updateValues(
    db,
    'mapOverlay',
    {
      measureBuilderConfig: {
        programCodes: NEW_PROGRAM_CODES,
        organisationUnitLevel: 'Facility',
      },
    },
    { id: 'FRIDGE_SOH_VALUE' },
  );
};

exports.down = async function(db) {
  await updateValues(
    db,
    'dashboardReport',
    {
      dataBuilderConfig: {
        dataSource: {
          type: 'single',
          codes: [
            'DOSES_375874bf',
            'DOSES_44ec84bf',
            'DOSES_7191781d',
            'DOSES_6fc9d81d',
            'DOSES_cd2d581d',
            'DOSES_4e6a681d',
            'DOSES_40a8681d',
            'DOSES_452a74bf',
          ],
          programCode: OLD_PROGRAM_CODE,
        },
        columnTitle: 'Stock Count',
      },
    },
    { id: 'Imms_FridgeVaccineCount' },
  );

  return updateValues(
    db,
    'mapOverlay',
    {
      measureBuilderConfig: {
        programCode: OLD_PROGRAM_CODE,
        organisationUnitLevel: 'Facility',
      },
    },
    { id: 'FRIDGE_SOH_VALUE' },
  );
};

exports._meta = {
  version: 1,
};
