'use strict';

import { codeToId, insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

const permissionGroupNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM permission_group WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const SCHOOL_REPORT_CODE = 'LESMIS_school_vitals';
const MULTI_SCHOOL_REPORT_CODE = 'LESMIS_multi_school_vitals';
const DISTRICT_REPORT_CODE = 'LESMIS_sub_district_vitals';

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
  await insertObject(db, 'report', {
    id: generateId(),
    code: SCHOOL_REPORT_CODE,
    config: {
      fetch: {
        dataElements: [
          'SchPop009',
          'SchPop010',
          'SchPop011',
          'SchPop012',
          'SchPop013',
          'SchPop014',
          'SchPop015',
          'SchPop016',
          'SchPop017',
          'SchPop018',
          'SchPop019',
          'SchPop020',
          'SchPop021',
          'SchPop022',
          'SchPop023',
          'SchPop024',
          'SchPop025',
          'SchPop026',
          'SchPop027',
          'SchPop028',
          'SchPop029',
          'SchPop030',
          'SchPop031',
          'SchPop032',
          'SchPop033',
          'SchPop034',
          'SchDISmr',
          'SchCVD026b',
          'SchFDpho',
        ],
      },
      transform: [
        'keyValueByDataElementName',
        'mostRecentValuePerOrgUnit',
        {
          transform: 'select',
          '...': ['organisationUnit'],
          "'Photo'": '$row.SchFDpho',
          "'ContactNumber'": '$row.SchCVD026b',
          "'NumberOfStudents'":
            'sum([$row.SchPop009,$row.SchPop010,$row.SchPop011,$row.SchPop012,$row.SchPop013,$row.SchPop014,$row.SchPop015,$row.SchPop016,$row.SchPop017,$row.SchPop018,$row.SchPop019,$row.SchPop020,$row.SchPop021,$row.SchPop022,$row.SchPop023,$row.SchPop024,$row.SchPop025,$row.SchPop026,$row.SchPop027,$row.SchPop028,$row.SchPop029,$row.SchPop030,$row.SchPop031,$row.SchPop032,$row.SchPop033,$row.SchPop034])',
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
          'SchPop009',
          'SchPop010',
          'SchPop011',
          'SchPop012',
          'SchPop013',
          'SchPop014',
          'SchPop015',
          'SchPop016',
          'SchPop017',
          'SchPop018',
          'SchPop019',
          'SchPop020',
          'SchPop021',
          'SchPop022',
          'SchPop023',
          'SchPop024',
          'SchPop025',
          'SchPop026',
          'SchPop027',
          'SchPop028',
          'SchPop029',
          'SchPop030',
          'SchPop031',
          'SchPop032',
          'SchPop033',
          'SchPop034',

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
          "'NumberOfStudents'":
            'sum([$row.SchPop009,$row.SchPop010,$row.SchPop011,$row.SchPop012,$row.SchPop013,$row.SchPop014,$row.SchPop015,$row.SchPop016,$row.SchPop017,$row.SchPop018,$row.SchPop019,$row.SchPop020,$row.SchPop021,$row.SchPop022,$row.SchPop023,$row.SchPop024,$row.SchPop025,$row.SchPop026,$row.SchPop027,$row.SchPop028,$row.SchPop029,$row.SchPop030,$row.SchPop031,$row.SchPop032,$row.SchPop033,$row.SchPop034])',
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
          "'Population'": '$row.SDP001',
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
};

exports.down = async function (db) {
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
};

exports._meta = {
  version: 1,
};
