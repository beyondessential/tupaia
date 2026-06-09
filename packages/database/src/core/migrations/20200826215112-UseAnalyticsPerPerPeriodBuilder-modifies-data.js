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

const REPORT = {
  id: 'Imms_FridgeDailyTemperatures',
  new: {
    dataBuilder: 'analyticsPerPeriod',
    config: {
      series: [
        { key: 'Max', dataElementCode: 'FRIDGE_MAX_TEMP' },
        { key: 'Min', dataElementCode: 'FRIDGE_MIN_TEMP' },
      ],
      programCode: 'FRIDGE_DAILY',
      aggregationType: 'FINAL_EACH_DAY',
    },
  },
  old: {
    dataBuilder: 'finalValuesPerDay',
    config: {
      series: [
        { key: 'Max', dataElementCodes: ['FRIDGE_MAX_TEMP'] },
        { key: 'Min', dataElementCodes: ['FRIDGE_MIN_TEMP'] },
      ],
      programCode: 'FRIDGE_DAILY',
    },
  },
};

const updateReport = (db, { id, dataBuilder, config }) =>
  db.runSql(
    `UPDATE "dashboardReport"
    SET
      "dataBuilder" = '${dataBuilder}',
      "dataBuilderConfig" ='${JSON.stringify(config)}'
    WHERE id = '${id}';`,
  );

exports.up = async function (db) {
  await updateReport(db, { id: REPORT.id, ...REPORT.new });
};

exports.down = async function (db) {
  await updateReport(db, { id: REPORT.id, ...REPORT.old });
};

exports._meta = {
  version: 1,
};
