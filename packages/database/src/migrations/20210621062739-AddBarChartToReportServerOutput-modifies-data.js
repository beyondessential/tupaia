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

const barChartCode = 'PG_Strive_PNG_Observed_Replicate_Mortality';
const getReport = async (db, code) => {
  const records = await db.runSql(
    `
      SELECT * FROM report
      WHERE code = '${code}'
    `,
  );
  if (records.rows[0]) {
    return records.rows[0];
  }
  throw new Error(`Can not find report with code ${code}`);
};

exports.up = async function (db) {
  const report = await getReport(db, barChartCode);
  const { config } = report;
  await updateValues(
    db,
    'report',
    { config: { ...config, output: { type: 'bar' } } },
    { code: barChartCode },
  );
};

exports.down = async function (db) {
  const report = await getReport(db, barChartCode);
  const { config } = report;
  const { output, ...restConfig } = config;
  await updateValues(db, 'report', { config: restConfig }, { code: barChartCode });
};

exports._meta = {
  version: 1,
};
