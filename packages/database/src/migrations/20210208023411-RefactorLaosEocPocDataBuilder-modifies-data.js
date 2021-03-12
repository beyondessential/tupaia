'use strict';

import { updateValues } from '../utilities';

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

exports.up = async function (db) {
  await updateValues(
    db,
    'dashboardReport',
    {
      dataBuilder: 'countEventsPerPeriodByDataValue',
      dataBuilderConfig: {
        periodType: 'week',
        dataElement: 'NCLE_Disease_Name', // Updated
        programCode: 'NCLE_Communicable_Disease',
        valuesOfInterest: [
          { label: 'Dengue fever without warning signs cases', value: '7.1' },
          { label: 'Dengue fever with warning signs cases', value: '7.2' },
          { label: 'Severe dengue cases', value: '7.3' },
        ],
        entityAggregation: { dataSourceEntityType: 'district' },
      },
    },
    { id: 'LA_EOC_Total_Dengue_Cases_by_Week' },
  );

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
