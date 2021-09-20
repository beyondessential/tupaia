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
        UNICEF: '=gt($SchDP_UNICEF, 0)',
        NumberOfSchools: '=$nosch_total',
        NumberOfStudents: '=$nostu_total',
        Population: '=$SDP001',
      },
      exclude: '*',
    },
  ],
};

// Add an extra data element to school vitals report
const updateSchoolVitalsReport = async db => {
  const report = await findSingleRecord(db, 'report', { code: 'LESMIS_school_vitals' });
  report.config.fetch.dataElements.push('school_complete');
  const updateIndex = report.config.transform.findIndex(x => x.transform === 'updateColumns');
  report.config.transform[updateIndex].insert.SchoolComplete = '=$school_complete';

  await updateValues(
    db,
    'report',
    { config: report.config }, // updated values
    { code: 'LESMIS_school_vitals' }, // find criteria
  );
};

// Remove school_complete from school vitals report
const downdateSchoolVitalsReport = async db => {
  const report = await findSingleRecord(db, 'report', { code: 'LESMIS_school_vitals' });
  const elementIndexToDelete = report.config.fetch.dataElements.findIndex(
    x => x === 'school_complete',
  );
  report.config.fetch.dataElements.splice(elementIndexToDelete, 1);
  const updateIndex = report.config.transform.findIndex(x => x.transform === 'updateColumns');
  delete report.config.transform[updateIndex].insert.SchoolComplete;

  await updateValues(
    db,
    'report',
    { config: report.config }, // updated values
    { code: 'LESMIS_school_vitals' }, // find criteria
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
};

exports.down = async function (db) {
  for (const partner of DEVELOPMENT_PARTNERS) {
    await deleteObject(db, 'indicator', { code: `${partner}_summary` });
  }
  await deleteObject(db, 'indicator', { code: NOSTU_TOTAL.code });
  await deleteObject(db, 'indicator', { code: NOSTU_PRIMARY_EDUCATION_TOTAL_INDICATOR.code });
  await deleteObject(db, 'report', { code: 'LESMIS_entity_vitals' });

  await downdateSchoolVitalsReport(db);
};

exports._meta = {
  version: 1,
};
