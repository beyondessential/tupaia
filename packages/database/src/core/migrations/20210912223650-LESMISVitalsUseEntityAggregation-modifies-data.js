'use strict';

import {
  insertObject,
  deleteObject,
  generateId,
  findSingleRecord,
  updateValues,
} from '../utilities';

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

const DEVELOPMENT_PARTNERS = [
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
];

const OBSOLETE_REPORTS = [
  'LESMIS_village_vitals',
  'LESMIS_sub_district_vitals',
  'LESMIS_multi_school_vitals',
];

const NEW_STUDENT_NUMBERS = [
  'nostu_e0_f',
  'nostu_e0_m',
  'nostu_e1_f',
  'nostu_e1_m',
  'nostu_e2_f',
  'nostu_e2_m',
  'nostu_e3_f',
  'nostu_e3_m',
  'nostu_pg_f',
  'nostu_pg_m',
  'nostu_p0_f',
  'nostu_p0_m',
  'nostu_p1_f',
  'nostu_p1_m',
  'nostu_p2_f',
  'nostu_p2_m',
  'nostu_p3_f',
  'nostu_p3_m',
  'nostu_p4_f',
  'nostu_p4_m',
  'nostu_p5_f',
  'nostu_p5_m',
  'nostu_s1_f',
  'nostu_s1_m',
  'nostu_s2_f',
  'nostu_s2_m',
  'nostu_s3_f',
  'nostu_s3_m',
  'nostu_s4_f',
  'nostu_s4_m',
  'nostu_s5_f',
  'nostu_s5_m',
  'nostu_s6_f',
  'nostu_s6_m',
  'nostu_s7_f',
  'nostu_s7_m',
];

const OLD_STUDENT_NUMBERS = [
  'SchPop001',
  'SchPop002',
  'SchPop003',
  'SchPop004',
  'SchPop005',
  'SchPop006',
  'SchPop007',
  'SchPop008',
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
];

// New indicators
const generateDevelopmentPartnerIndicator = baseDataElement => ({
  id: generateId(),
  code: `${baseDataElement}_summary`,
  builder: 'analyticArithmetic',
  config: {
    formula: `${baseDataElement} > 0`,
    aggregation: [
      'MOST_RECENT',
      {
        type: 'COUNT_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'school',
          aggregationEntityType: 'requested',
        },
      },
    ],
    defaultValues: {
      [`${baseDataElement}`]: 0,
    },
  },
});

// ece, lse, use already exist from WAI-44
const NOSTU_PRIMARY_EDUCATION_TOTAL_INDICATOR = {
  id: generateId(),
  code: 'nostu_pe_t',
  builder: 'analyticArithmetic',
  config: {
    formula: 'nostu_pe_f_public + nostu_pe_f_private + nostu_pe_m_public + nostu_pe_m_private',
    aggregation: [
      'MOST_RECENT',
      {
        type: 'SUM_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'sub_district',
          aggregationEntityType: 'requested',
        },
      },
    ],
    defaultValues: {
      nostu_pe_f_public: 0,
      nostu_pe_f_private: 0,
      nostu_pe_m_public: 0,
      nostu_pe_m_private: 0,
    },
  },
};

const NOSTU_TOTAL = {
  id: generateId(),
  code: 'nostu_total',
  builder: 'analyticArithmetic',
  config: {
    formula: 'nostu_ece_t + nostu_pe_t + nostu_lse_t + nostu_use_t',
    aggregation: [
      'MOST_RECENT',
      {
        type: 'SUM_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'sub_district',
          aggregationEntityType: 'requested',
        },
      },
    ],
    defaultValues: {
      nostu_ece_t: 0,
      nostu_pe_t: 0,
      nostu_lse_t: 0,
      nostu_use_t: 0,
    },
  },
};

// New reports
const ENTITY_VITALS_REPORT_CONFIG = {
  fetch: {
    dataElements: [
      'SDP001',
      'nosch_total',
      'nostu_total',
      ...DEVELOPMENT_PARTNERS.map(dataElement => `${dataElement}_summary`),
    ],
    aggregations: [
      'MOST_RECENT',
      {
        type: 'SUM_PER_ORG_GROUP',
        config: {
          dataSourceEntityType: 'sub_district',
          aggregationEntityType: 'requested',
        },
      },
    ],
  },
  transform: [
    'keyValueByDataElementName',
    {
      transform: 'mergeRows',
      groupBy: 'organisationUnit',
      using: {
        period: 'last',
        '*': 'single',
      },
    },
    {
      transform: 'updateColumns',
      insert: {
        WB: '=gt($SchDP_WB_summary, 0)',
        WC: '=gt($SchDP_WC_summary, 0)',
        WR: '=gt($SchDP_WR_summary, 0)',
        WV: '=gt($SchDP_WV_summary, 0)',
        CRS: '=gt($SchDP_CRS_summary, 0)',
        HII: '=gt($SchDP_HII_summary, 0)',
        RtR: '=gt($SchDP_RtR_summary, 0)',
        WFP: '=gt($SchDP_WFP_summary, 0)',
        AEAL: '=gt($SchDP_AEAL_summary, 0)',
        Plan: '=gt($SchDP_Plan_summary, 0)',
        Other: '=gt($SchCVD023_summary, 0)',
        UNICEF: '=gt($SchDP_UNICEF_summary, 0)',
        NumberOfSchools: '=$nosch_total',
        NumberOfStudents: '=$nostu_total',
        Population: '=$SDP001',
      },
      exclude: '*',
    },
  ],
};

const generateStudentCountIndicator = dataElements => ({
  formula: dataElements.join(' + '),
  aggregation: 'MOST_RECENT',
  defaultValues: dataElements.reduce((obj, dataElement) => ({ ...obj, [dataElement]: 0 }), {}),
});

const SCHOOL_VITALS_NEW_VALUES = {
  SchoolComplete: '=$school_complete',
  WB: '=exists($SchDP_WB)',
  WC: '=exists($SchDP_WC)',
  WR: '=exists($SchDP_WR)',
  WV: '=exists($SchDP_WV)',
  CRS: '=exists($SchDP_CRS)',
  HII: '=exists($SchDP_HII)',
  RtR: '=exists($SchDP_RtR)',
  WFP: '=exists($SchDP_WFP)',
  AEAL: '=exists($SchDP_AEAL)',
  Plan: '=exists($SchDP_Plan)',
  Other: '=exists($SchCVD023)',
  UNICEF: '=exists($SchDP_UNICEF)',
};

// Add an extra data element to school vitals report
const updateSchoolVitalsReport = async db => {
  const report = await findSingleRecord(db, 'report', { code: 'LESMIS_school_vitals' });
  report.config.fetch.dataElements.push('school_complete');
  for (const partner of DEVELOPMENT_PARTNERS) {
    report.config.fetch.dataElements.push(partner);
  }
  const updateIndex = report.config.transform.findIndex(x => x.transform === 'updateColumns');
  report.config.transform[updateIndex].insert = {
    ...SCHOOL_VITALS_NEW_VALUES,
    ...report.config.transform[updateIndex].insert,
  };

  await updateValues(
    db,
    'report',
    { config: report.config }, // updated values
    { code: 'LESMIS_school_vitals' }, // find criteria
  );
};

// Update the LESMIS_Student_Count indicator to use the newer data elements
const updateLESMISStudentCount = async db => {
  const indicator = await findSingleRecord(db, 'indicator', { code: 'LESMIS_Student_Count' });
  indicator.config = generateStudentCountIndicator(NEW_STUDENT_NUMBERS);
  await updateValues(
    db,
    'indicator',
    { config: indicator.config }, // updated values
    { code: 'LESMIS_Student_Count' }, // find criteria
  );
};

// Remove school_complete from school vitals report
const downdateSchoolVitalsReport = async db => {
  const report = await findSingleRecord(db, 'report', { code: 'LESMIS_school_vitals' });
  for (const dataElement of [...DEVELOPMENT_PARTNERS, 'school_complete']) {
    const elementIndexToDelete = report.config.fetch.dataElements.findIndex(x => x === dataElement);
    report.config.fetch.dataElements.splice(elementIndexToDelete, 1);
  }
  const updateIndex = report.config.transform.findIndex(x => x.transform === 'updateColumns');
  for (const key of Object.keys(SCHOOL_VITALS_NEW_VALUES)) {
    delete report.config.transform[updateIndex].insert[key];
  }

  await updateValues(
    db,
    'report',
    { config: report.config }, // updated values
    { code: 'LESMIS_school_vitals' }, // find criteria
  );
};
// Update the LESMIS_Student_Count indicator to use the older data elements
const downdateLESMISStudentCount = async db => {
  const indicator = await findSingleRecord(db, 'indicator', { code: 'LESMIS_Student_Count' });
  indicator.config = generateStudentCountIndicator(OLD_STUDENT_NUMBERS);
  await updateValues(
    db,
    'indicator',
    { config: indicator.config }, // updated values
    { code: 'LESMIS_Student_Count' }, // find criteria
  );
};

const insertReport = async (db, { code, reportConfig, permissionGroup }) => {
  const reportId = generateId();
  const permissionGroupId = (
    await findSingleRecord(db, 'permission_group', { name: permissionGroup })
  ).id;
  await insertObject(db, 'report', {
    id: reportId,
    code,
    config: reportConfig,
    permission_group_id: permissionGroupId,
  });
};

exports.up = async function (db) {
  for (const code of OBSOLETE_REPORTS) {
    await deleteObject(db, 'report', { code });
  }
  for (const partner of DEVELOPMENT_PARTNERS) {
    await insertObject(db, 'indicator', generateDevelopmentPartnerIndicator(partner));
  }
  await insertObject(db, 'indicator', NOSTU_PRIMARY_EDUCATION_TOTAL_INDICATOR);
  await insertObject(db, 'indicator', NOSTU_TOTAL);

  await insertReport(db, {
    code: 'LESMIS_entity_vitals',
    reportConfig: ENTITY_VITALS_REPORT_CONFIG,
    permissionGroup: 'LESMIS Public',
  });

  await updateSchoolVitalsReport(db);
  await updateLESMISStudentCount(db);
};

exports.down = async function (db) {
  for (const partner of DEVELOPMENT_PARTNERS) {
    await deleteObject(db, 'indicator', { code: `${partner}_summary` });
  }
  await deleteObject(db, 'indicator', { code: NOSTU_TOTAL.code });
  await deleteObject(db, 'indicator', { code: NOSTU_PRIMARY_EDUCATION_TOTAL_INDICATOR.code });
  await deleteObject(db, 'report', { code: 'LESMIS_entity_vitals' });

  await downdateSchoolVitalsReport(db);
  await downdateLESMISStudentCount(db);
};

exports._meta = {
  version: 1,
};
