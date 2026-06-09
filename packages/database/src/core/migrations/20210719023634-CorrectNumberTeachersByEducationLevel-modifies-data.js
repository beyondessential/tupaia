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

const CODE = 'LESMIS_teachers_education_level_district';

const NEW_REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'noteach_pe_public_f',
      'noteach_pe_public_m',
      'noteach_pe_private_f',
      'noteach_pe_private_m',
      'noteach_se_public_f',
      'noteach_se_public_m',
      'noteach_se_private_f',
      'noteach_se_private_m',
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
        "translate($row.dataElement, { noteach_pe_public_f: 'Primary Education (Public)', noteach_pe_public_m: 'Primary Education (Public)', noteach_pe_private_f: 'Primary Education (Private)', noteach_pe_private_m: 'Primary Education (Private)', noteach_se_public_f: 'Secondary Education (Public)', noteach_se_public_m: 'Secondary Education (Public)', noteach_se_private_f: 'Secondary Education (Private)', noteach_se_private_m: 'Secondary Education (Private)' })",
      '...': ['value', 'dataElement'],
    },
    'keyValueByDataElementName',
    {
      name: 'group',
      transform: 'aggregate',
      '...': 'sum',
    },
    {
      transform: 'select',
      "'Male'":
        'sum([$row.noteach_pe_public_m, $row.noteach_pe_private_m, $row.noteach_se_public_m, $row.noteach_se_private_m])',
      "'Female'":
        'sum([$row.noteach_pe_public_f, $row.noteach_pe_private_f, $row.noteach_se_public_f, $row.noteach_se_private_f])',
      '...': ['name'],
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      "'Male_metadata'": '{ total: $row.Male + $row.Female }',
      "'Female_metadata'": '{ total: $row.Male + $row.Female }',
      '...': '*',
    },
    {
      transform: 'select',
      "'sort_order'":
        "translate($row.name, { 'Primary Education (Public)': 1, 'Primary Education (Private)': 2, 'Secondary Education (Public)': 3, 'Secondary Education (Private)': 4 })",
      '...': '*',
    },
    {
      transform: 'sort',
      by: '$row.sort_order',
    },
    {
      transform: 'select',
      '...': ['name', 'Male', 'Female', 'GPI', 'Male_metadata', 'Female_metadata'],
    },
  ],
};

const OLD_REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'noteach_pe_public_f',
      'noteach_pe_public_m',
      'noteach_pe_private_f',
      'noteach_pe_private_m',
      'noteach_se_public_f',
      'noteach_se_public_m',
      'noteach_se_private_f',
      'noteach_se_private_m',
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
        "translate($row.dataElement, { noteach_pe_public_f: 'Primary Education (Public)', noteach_pe_public_m: 'Primary Education (Public)', noteach_pe_private_f: 'Primary Education (Private)', noteach_pe_private_m: 'Primary Education (Private)', noteach_se_public_f: 'Secondary Education (Public)', noteach_se_public_m: 'Secondary Education (Public)', noteach_se_private_f: 'Secondary Education (Private)', noteach_se_private_m: 'Secondary Education (Private)' })",
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
      "'Male'":
        'sum([$row.noteach_pe_public_m, $row.noteach_pe_private_m, $row.noteach_se_public_m, $row.noteach_se_private_m])',
      "'Female'":
        'sum([$row.noteach_pe_public_f, $row.noteach_pe_private_f, $row.noteach_se_public_f, $row.noteach_se_private_f])',
      '...': ['name'],
    },
    {
      transform: 'select',
      "'GPI'": '$row.Female/$row.Male',
      "'Male_metadata'": '{ total: $row.Male + $row.Female }',
      "'Female_metadata'": '{ total: $row.Male + $row.Female }',
      '...': '*',
    },
    {
      transform: 'select',
      "'sort_order'":
        "translate($row.name, { 'Primary Education (Public)': 1, 'Primary Education (Private)': 2, 'Secondary Education (Public)': 3, 'Secondary Education (Private)': 4 })",
      '...': '*',
    },
    {
      transform: 'sort',
      by: '$row.sort_order',
    },
    {
      transform: 'select',
      '...': ['name', 'Male', 'Female', 'GPI', 'Male_metadata', 'Female_metadata'],
    },
  ],
};

exports.up = async function (db) {
  return db.runSql(
    `
    UPDATE "report"
    SET config = ?
    WHERE code = '${CODE}';
  `,
    [JSON.stringify(OLD_REPORT_CONFIG)],
  );
};

exports.up = async function (db) {
  return db.runSql(
    `
    UPDATE "report"
    SET config = ?
    WHERE code = '${CODE}';
  `,
    [JSON.stringify(NEW_REPORT_CONFIG)],
  );
};

exports._meta = {
  version: 1,
};
