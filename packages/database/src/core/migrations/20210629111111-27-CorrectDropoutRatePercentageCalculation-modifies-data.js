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

const LOWER_SECONDARY = {
  code: 'LESMIS_dropout_rate_by_grade_lower_secondary',
  oldReportConfig: {
    fetch: {
      dataElements: [
        'dor_district_s1_t',
        'dor_district_s1_f',
        'dor_district_s1_m',
        'dor_district_s2_t',
        'dor_district_s2_f',
        'dor_district_s2_m',
        'dor_district_s3_t',
        'dor_district_s3_f',
        'dor_district_s3_m',
        'dor_district_s4_t',
        'dor_district_s4_f',
        'dor_district_s4_m',
        'dor_district_lse_t',
        'dor_district_lse_f',
        'dor_district_lse_m',
      ],
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, {   dor_district_s1_t: 'Grade 6', dor_district_s1_f: 'Grade 6', dor_district_s1_m: 'Grade 6', dor_district_s2_t: 'Grade 7', dor_district_s2_f: 'Grade 7', dor_district_s2_m: 'Grade 7', dor_district_s3_t: 'Grade 8', dor_district_s3_f: 'Grade 8', dor_district_s3_m: 'Grade 8', dor_district_s4_t: 'Grade 9', dor_district_s4_f: 'Grade 9', dor_district_s4_m: 'Grade 9', dor_district_lse_t: 'Total', dor_district_lse_f: 'Total', dor_district_lse_m: 'Total' })",
        '...': '*',
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'last',
      },
      {
        transform: 'select',

        "'Female'":
          'sum([$row.dor_district_s1_f, $row.dor_district_s2_f, $row.dor_district_s3_f, $row.dor_district_s4_f, $row.dor_district_lse_f])',
        "'Male'":
          'sum([$row.dor_district_s1_m, $row.dor_district_s2_m, $row.dor_district_s3_m, $row.dor_district_s4_m, $row.dor_district_lse_m])',
        "'Total'":
          'sum([$row.dor_district_s1_t, $row.dor_district_s2_t, $row.dor_district_s3_t, $row.dor_district_s4_t, $row.dor_district_lse_t])',
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
  newReportConfig: {
    fetch: {
      dataElements: [
        'dor_district_s1_t',
        'dor_district_s1_f',
        'dor_district_s1_m',
        'dor_district_s2_t',
        'dor_district_s2_f',
        'dor_district_s2_m',
        'dor_district_s3_t',
        'dor_district_s3_f',
        'dor_district_s3_m',
        'dor_district_s4_t',
        'dor_district_s4_f',
        'dor_district_s4_m',
        'dor_district_lse_t',
        'dor_district_lse_f',
        'dor_district_lse_m',
      ],
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, {   dor_district_s1_t: 'Grade 6', dor_district_s1_f: 'Grade 6', dor_district_s1_m: 'Grade 6', dor_district_s2_t: 'Grade 7', dor_district_s2_f: 'Grade 7', dor_district_s2_m: 'Grade 7', dor_district_s3_t: 'Grade 8', dor_district_s3_f: 'Grade 8', dor_district_s3_m: 'Grade 8', dor_district_s4_t: 'Grade 9', dor_district_s4_f: 'Grade 9', dor_district_s4_m: 'Grade 9', dor_district_lse_t: 'Total', dor_district_lse_f: 'Total', dor_district_lse_m: 'Total' })",
        '...': '*',
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'last',
      },
      {
        transform: 'select',

        "'Female'":
          'sum([$row.dor_district_s1_f, $row.dor_district_s2_f, $row.dor_district_s3_f, $row.dor_district_s4_f, $row.dor_district_lse_f]) / 100',
        "'Male'":
          'sum([$row.dor_district_s1_m, $row.dor_district_s2_m, $row.dor_district_s3_m, $row.dor_district_s4_m, $row.dor_district_lse_m]) / 100',
        "'Total'":
          'sum([$row.dor_district_s1_t, $row.dor_district_s2_t, $row.dor_district_s3_t, $row.dor_district_s4_t, $row.dor_district_lse_t]) / 100',
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
};

const UPPER_SECONDARY = {
  code: 'LESMIS_dropout_rate_by_grade_upper_secondary',
  oldReportConfig: {
    fetch: {
      dataElements: [
        'dor_district_s5_t',
        'dor_district_s5_f',
        'dor_district_s5_m',
        'dor_district_s6_t',
        'dor_district_s6_f',
        'dor_district_s6_m',
        'dor_district_s7_t',
        'dor_district_s7_f',
        'dor_district_s7_m',
        'dor_district_use_t',
        'dor_district_use_f',
        'dor_district_use_m',
      ],
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, {   dor_district_s5_t: 'Grade 10', dor_district_s5_f: 'Grade 10', dor_district_s5_m: 'Grade 10', dor_district_s6_t: 'Grade 11', dor_district_s6_f: 'Grade 11', dor_district_s6_m: 'Grade 11', dor_district_s7_t: 'Grade 12', dor_district_s7_f: 'Grade 12', dor_district_s7_m: 'Grade 12', dor_district_use_t: 'Total', dor_district_use_f: 'Total', dor_district_use_m: 'Total' })",
        '...': '*',
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'last',
      },
      {
        transform: 'select',

        "'Female'":
          'sum([$row.dor_district_s5_f, $row.dor_district_s6_f, $row.dor_district_s7_f, $row.dor_district_use_f])',
        "'Male'":
          'sum([$row.dor_district_s5_m, $row.dor_district_s6_m, $row.dor_district_s7_m, $row.dor_district_use_m])',
        "'Total'":
          'sum([$row.dor_district_s5_t, $row.dor_district_s6_t, $row.dor_district_s7_t, $row.dor_district_use_t])',
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
  newReportConfig: {
    fetch: {
      dataElements: [
        'dor_district_s5_t',
        'dor_district_s5_f',
        'dor_district_s5_m',
        'dor_district_s6_t',
        'dor_district_s6_f',
        'dor_district_s6_m',
        'dor_district_s7_t',
        'dor_district_s7_f',
        'dor_district_s7_m',
        'dor_district_use_t',
        'dor_district_use_f',
        'dor_district_use_m',
      ],
      aggregations: [
        {
          type: 'MOST_RECENT',
          config: {
            dataSourceEntityType: 'sub_district',
          },
        },
      ],
    },
    transform: [
      {
        transform: 'select',
        "'name'":
          "translate($row.dataElement, {   dor_district_s5_t: 'Grade 10', dor_district_s5_f: 'Grade 10', dor_district_s5_m: 'Grade 10', dor_district_s6_t: 'Grade 11', dor_district_s6_f: 'Grade 11', dor_district_s6_m: 'Grade 11', dor_district_s7_t: 'Grade 12', dor_district_s7_f: 'Grade 12', dor_district_s7_m: 'Grade 12', dor_district_use_t: 'Total', dor_district_use_f: 'Total', dor_district_use_m: 'Total' })",
        '...': '*',
      },
      'keyValueByDataElementName',
      {
        transform: 'aggregate',
        name: 'group',
        '...': 'last',
      },
      {
        transform: 'select',

        "'Female'":
          'sum([$row.dor_district_s5_f, $row.dor_district_s6_f, $row.dor_district_s7_f, $row.dor_district_use_f]) / 100',
        "'Male'":
          'sum([$row.dor_district_s5_m, $row.dor_district_s6_m, $row.dor_district_s7_m, $row.dor_district_use_m]) / 100',
        "'Total'":
          'sum([$row.dor_district_s5_t, $row.dor_district_s6_t, $row.dor_district_s7_t, $row.dor_district_use_t]) / 100',
        '...': ['name'],
      },
      {
        transform: 'sort',
        by: '$row.name',
      },
    ],
  },
};

const updateReportConfig = async (db, code, config) =>
  updateValues(db, 'report', { config }, { code });

exports.up = async function (db) {
  for (const { code, newReportConfig } of [LOWER_SECONDARY, UPPER_SECONDARY]) {
    await updateReportConfig(db, code, newReportConfig);
  }
};

exports.down = async function (db) {
  for (const { code, oldReportConfig } of [LOWER_SECONDARY, UPPER_SECONDARY]) {
    await updateReportConfig(db, code, oldReportConfig);
  }
};

exports._meta = {
  version: 1,
};
