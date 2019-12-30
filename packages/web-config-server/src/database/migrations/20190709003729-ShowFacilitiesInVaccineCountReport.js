'use strict';

import { updateValues } from '../migrationUtilities';

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

const REPORT_ID = 'Imms_FridgeVaccineCount';

exports.up = async function(db) {
  return updateValues(
    db,
    'dashboardReport',
    {
      dataBuilder: 'organisationUnitTable',
      dataBuilderConfig: {
        dataSource: {
          type: 'single',
          programCode: 'FRIDGE_DAILY',
          codes: [
            'QTY_375874bf',
            'QTY_44ec84bf',
            'QTY_7191781d',
            'QTY_6fc9d81d',
            'QTY_cd2d581d',
            'QTY_4e6a681d',
            'QTY_40a8681d',
            'QTY_452a74bf',
          ],
        },
        columnTitle: 'Stock Count',
      },
    },
    { id: REPORT_ID },
  );
};

exports.down = async function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
