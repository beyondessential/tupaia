'use strict';

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

// all the report names below are just changing from Weekly... to Monthly...
const MONTHLY_REPORT_NAMES = {
  TO_CH_Validation_CH6: 'Monthly Clinic Dressings and Other Services',
  TO_CH_Validation_CH7: 'Monthly Outreach Program',
  TO_CH_Validation_CH8: 'Monthly Number of Consultations',
  TO_CH_Validation_CH5: 'Monthly DM II/HTN Clinics',
  TO_CH_Validation_CH9: 'Monthly Illness and Syndromic Surveillance',
  TO_CH_Home_Visits: 'Monthly Home Visits Completion',
};

exports.up = function(db) {
  const sqlForStandardCases = Object.entries(MONTHLY_REPORT_NAMES)
    .map(
      ([id, name]) => `
      UPDATE
        "dashboardReport"
      SET
        "viewJson" = "viewJson" || '{ "name": "${name}", "periodGranularity": "one_month_at_a_time" }'
      WHERE
        "id" = '${id}';
    `,
    )
    .join('\n');

  const sqlForSpecialCases = `
    UPDATE
        "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{ "periodGranularity": "month" }'
    WHERE
      "id" = 'TO_CH_Descriptive_ClinicDressings';

    UPDATE
        "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{ "xName": "Month" }'
    WHERE
      "id" = 'TO_CH_Home_Visits';
  `;
  return db.runSql(`
    ${sqlForStandardCases}

    ${sqlForSpecialCases}
  `);
};

const WEEKLY_REPORT_NAMES = {
  TO_CH_Validation_CH6: 'Weekly Clinic Dressings and Other Services',
  TO_CH_Validation_CH7: 'Weekly Outreach Program',
  TO_CH_Validation_CH8: 'Weekly Number of Consultations',
  TO_CH_Validation_CH5: 'Weekly DM II/HTN Clinics',
  TO_CH_Validation_CH9: 'Weekly Illness and Syndromic Surveillance',
  TO_CH_Home_Visits: 'Weekly Home Visits Completion',
};

exports.down = function(db) {
  const sqlForStandardCases = Object.entries(WEEKLY_REPORT_NAMES)
    .map(
      (id, name) => `
      UPDATE
        "dashboardReport"
      SET
        "viewJson" = "viewJson" || '{ "name": "${name}", "periodGranularity": "one_week_at_a_time" }'
      WHERE
        "id" = '${id}';
    `,
    )
    .join('\n');

  const sqlForSpecialCases = `
    UPDATE
        "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{ "periodGranularity": "week" }'
    WHERE
      "id" = 'TO_CH_Descriptive_ClinicDressings';

    UPDATE
      "dashboardReport"
    SET
      "viewJson" = "viewJson" || '{ "xName": "Week" }'
    WHERE
      "id" = 'TO_CH_Home_Visits';
  `;
  return db.runSql(`
    ${sqlForStandardCases}

    ${sqlForSpecialCases}
  `);
};

exports._meta = {
  version: 1,
};
