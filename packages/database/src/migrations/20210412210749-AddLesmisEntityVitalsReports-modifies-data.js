'use strict';

import { insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const STUDENT_COUNT_INDICATOR_CODE = 'LESMIS_Student_Count';
const SCHOOL_REPORT_CODE = 'LESMIS_school_vitals';
const MULTI_SCHOOL_REPORT_CODE = 'LESMIS_multi_school_vitals';
const DISTRICT_REPORT_CODE = 'LESMIS_sub_district_vitals';
const VILLAGE_REPORT_CODE = 'LESMIS_village_vitals';

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
  await insertObject(db, 'indicator', {
    id: generateId(),
    code: STUDENT_COUNT_INDICATOR_CODE,
    builder: 'analyticArithmetic',
    config: {
      formula:
        'SchPop001 + SchPop002 + SchPop003 + SchPop004 + SchPop005 + SchPop006 + SchPop007 + SchPop008 + SchPop009 + SchPop010 + SchPop011 + SchPop012 + SchPop013 + SchPop014 + SchPop015 + SchPop016 + SchPop017 + SchPop018 + SchPop019 + SchPop020 + SchPop021 + SchPop022 + SchPop023 + SchPop024 + SchPop025 + SchPop026 + SchPop027 + SchPop028 + SchPop029 + SchPop030 + SchPop031 + SchPop032 + SchPop033 + SchPop034',
      aggregation: 'MOST_RECENT',
      defaultValues: {
        SchPop001: 0,
        SchPop002: 0,
        SchPop003: 0,
        SchPop004: 0,
        SchPop005: 0,
        SchPop006: 0,
        SchPop007: 0,
        SchPop008: 0,
        SchPop009: 0,
        SchPop010: 0,
        SchPop011: 0,
        SchPop012: 0,
        SchPop013: 0,
        SchPop014: 0,
        SchPop015: 0,
        SchPop016: 0,
        SchPop017: 0,
        SchPop018: 0,
        SchPop019: 0,
        SchPop020: 0,
        SchPop021: 0,
        SchPop022: 0,
        SchPop023: 0,
        SchPop024: 0,
        SchPop025: 0,
        SchPop026: 0,
        SchPop027: 0,
        SchPop028: 0,
        SchPop029: 0,
        SchPop030: 0,
        SchPop031: 0,
        SchPop032: 0,
        SchPop033: 0,
        SchPop034: 0,
      },
    },
  });
  await insertObject(db, 'data_source', {
    id: generateId(),
    code: STUDENT_COUNT_INDICATOR_CODE,
    type: 'dataElement',
    service_type: 'indicator',
  });

  await insertObject(db, 'report', {
    id: generateId(),
    code: SCHOOL_REPORT_CODE,
    config: {
      fetch: {
        dataElements: [STUDENT_COUNT_INDICATOR_CODE, 'SchDISmr', 'SchCVD026b', 'SchFDpho'],
      },
      transform: [
        'keyValueByDataElementName',
        'mostRecentValuePerOrgUnit',
        {
          transform: 'select',
          '...': ['organisationUnit'],
          "'Photo'": '$row.SchFDpho',
          "'ContactNumber'": '$row.SchCVD026b',
          "'NumberOfStudents'": `$row.${STUDENT_COUNT_INDICATOR_CODE}`,
          "'DistanceToMainRoad'": '$row.SchDISmr',
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'Public'),
  });

  await insertObject(db, 'report', {
    id: generateId(),
    code: MULTI_SCHOOL_REPORT_CODE,
    config: {
      fetch: {
        dataElements: [
          STUDENT_COUNT_INDICATOR_CODE,

          'SchDP_AEAL',
          'SchDP_CRS',
          'SchDP_HII',
          'SchDP_Plan',
          'SchDP_RtR',
          'SchDP_UNICEF',
          'SchDP_WB',
          'SchDP_WC',
          'SchDP_WFP',
          'SchDP_WR',
          'SchDP_WV',
          'SchCVD023',
        ],
      },
      transform: [
        'keyValueByDataElementName',
        'mostRecentValuePerOrgUnit',
        {
          transform: 'select',
          "'NumberOfStudents'": `$row.${STUDENT_COUNT_INDICATOR_CODE}`,
          "'NumberOfSchools'": '1',
          "'AEAL'": 'exists($row.SchDP_AEAL)',
          "'CRS'": 'exists($row.SchDP_CRS)',
          "'HII'": 'exists($row.SchDP_HII)',
          "'Plan'": 'exists($row.SchDP_Plan)',
          "'RtR'": 'exists($row.SchDP_RtR)',
          "'UNICEF'": 'exists($row.SchDP_UNICEF)',
          "'WB'": 'exists($row.SchDP_WB)',
          "'WC'": 'exists($row.SchDP_WC)',
          "'WFP'": 'exists($row.SchDP_WFP)',
          "'WR'": 'exists($row.SchDP_WR)',
          "'WV'": 'exists($row.SchDP_WV)',
          "'Other'": 'exists($row.SchCVD023)',
        },
        {
          transform: 'aggregate',
          NumberOfStudents: 'sum',
          NumberOfSchools: 'count',
          AEAL: 'max',
          CRS: 'max',
          HII: 'max',
          Plan: 'max',
          RtR: 'max',
          UNICEF: 'max',
          WB: 'max',
          WC: 'max',
          WFP: 'max',
          WR: 'max',
          WV: 'max',
          Other: 'max',
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'Public'),
  });

  await insertObject(db, 'report', {
    id: generateId(),
    code: DISTRICT_REPORT_CODE,
    config: {
      fetch: {
        dataElements: ['SDP001', 'SPD001'],
      },
      transform: [
        'keyValueByDataElementName',
        'mostRecentValuePerOrgUnit',
        {
          transform: 'select',
          "'Population'": 'exists($row.SDP001) ? $row.SDP001 : 0',
          "'PriorityDistrict'": '$row.SPD001',
        },
        {
          transform: 'aggregate',
          Population: 'sum',
          PriorityDistrict: 'default',
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'Public'),
  });

  await insertObject(db, 'report', {
    id: generateId(),
    code: VILLAGE_REPORT_CODE,
    config: {
      fetch: {
        dataElements: ['SVP001'],
      },
      transform: [
        'keyValueByDataElementName',
        'mostRecentValuePerOrgUnit',
        {
          transform: 'select',
          "'Population'": '$row.SVP001',
        },
      ],
    },
    permission_group_id: await permissionGroupNameToId(db, 'Public'),
  });
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM indicator
    WHERE code = '${STUDENT_COUNT_INDICATOR_CODE}';
  `);
  await db.runSql(`
    DELETE FROM data_source
    WHERE code = '${STUDENT_COUNT_INDICATOR_CODE}';
  `);
  await db.runSql(`
    DELETE FROM report
    WHERE code = '${SCHOOL_REPORT_CODE}';
  `);
  await db.runSql(`
    DELETE FROM report
    WHERE code = '${MULTI_SCHOOL_REPORT_CODE}';
  `);
  await db.runSql(`
    DELETE FROM report
    WHERE code = '${DISTRICT_REPORT_CODE}';
  `);
  await db.runSql(`
    DELETE FROM report
    WHERE code = '${VILLAGE_REPORT_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
