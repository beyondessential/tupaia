'use strict';

import { arrayToDbString } from '../utilities';

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

const REPORTS = {
  PG_Strive_PNG_Prev_7_Days_Reported_Cases: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 6)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -6,
      },
    },
  },
  covid_ki_d_active_case_numbers: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 13)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -13,
      },
    },
  },
  covid_ws_heatmap_covid_active_cases_village: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 14)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -14,
      },
    },
  },
  covid_ws_heatmap_covid_active_cases_district: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 14)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -14,
      },
    },
  },
  covid_ws_heatmap_covid_active_cases_island: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 14)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -14,
      },
    },
  },
  covid_ki_n_active_case_numbers: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 13)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -13,
      },
    },
  },
  covid_ki_sd_active_case_numbers: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 13)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -13,
      },
    },
  },
  covid_to_line_effective_r_number: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 11)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -11,
      },
    },
  },
  covid_nr_d_active_case_numbers: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 13)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -13,
      },
    },
  },
  covid_to_line_effective_r_number_validated: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 11)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -11,
      },
    },
  },
  covid_to_line_effective_r_number_validation: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 11)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -11,
      },
    },
  },
  covid_fj_tourism_n_view_total_new_cases_14_days: {
    new: { startDate: '= dateUtils.subDays(date(@params.startDate), 13)' },
    old: {
      startDate: {
        unit: 'day',
        offset: -13,
      },
    },
  },
};

exports.up = async function (db) {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE code IN (${arrayToDbString(Object.keys(REPORTS))});`,
  );
  for (const report of reports) {
    const { config, code } = report;
    const { transform } = config;
    const { parameters, ...restOfFetchDataTransformStep } = transform.shift();
    const newConfig = {
      ...config,
      transform: [
        { ...restOfFetchDataTransformStep, parameters: { ...parameters, ...REPORTS[code].new } },
        ...transform,
      ],
    };
    await db.runSql(
      `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
        "'",
        "''",
      )}'::json WHERE id = '${report.id}'`,
    );
  }
};

exports.down = async function (db) {
  const { rows: reports } = await db.runSql(
    `SELECT * FROM report WHERE code IN (${arrayToDbString(Object.keys(REPORTS))});`,
  );
  for (const report of reports) {
    const { config, code } = report;
    const { transform } = config;
    const { parameters, ...restOfFetchDataTransformStep } = transform.shift();
    const newConfig = {
      ...config,
      transform: [
        { ...restOfFetchDataTransformStep, parameters: { ...parameters, ...REPORTS[code].old } },
        ...transform,
      ],
    };
    await db.runSql(
      `UPDATE report SET config = '${JSON.stringify(newConfig).replaceAll(
        "'",
        "''",
      )}'::json WHERE id = '${report.id}'`,
    );
  }
};

exports._meta = {
  version: 1,
};
