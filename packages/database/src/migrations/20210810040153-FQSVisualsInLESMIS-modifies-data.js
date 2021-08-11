'use strict';

import { insertObject, generateId, findSingleRecord, findSingleRecordBySql } from '../utilities';

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

const FQS1_DATA_MAP = [
  {
    dataElement: 'lesmis_fqs1_stdbuilding',
    label:
      'All school buildings (100%) have a semi-permanent standard building / classroom or above',
  },
  { dataElement: 'lesmis_fqs1_office', label: 'One (1) office or teacher room per school' },
  {
    dataElement: 'lesmis_fqs1_cabinet',
    label: 'One (1) cabinet or document file cabinet per school',
  },
  {
    dataElement: 'lesmis_fqs1_water',
    label: 'School has water for the use the whole year through',
  },
  {
    dataElement: 'lesmis_fqs1_latrine',
    label:
      'School has latrine for the normal use; at least 2 latrines - 1 for girls and 1 for boys',
  },
  { dataElement: 'lesmis_fqs1_board', label: 'One (1) usable board per classroom' },
  { dataElement: 'lesmis_fqs1_map', label: 'One (1) Lao country map per classroom' },
  {
    dataElement: 'lesmis_fqs1_table',
    label: 'Classroom has a table for each student to use for study (100%)',
  },
  {
    dataElement: 'lesmis_fqs1_chair',
    label: 'Classroom has chairs for study for each student (100%)',
  },
  {
    dataElement: 'lesmis_fqs1_t_tablechair',
    label: 'Classroom has a table and chair for each teacher (1 set per classroom)',
  },
  {
    dataElement: 'lesmis_fqs1_p_qual',
    label:
      'Principal/head of school has qualification in area of teacher education - graduated middle level diploma in area of teacher education or above',
  },
  {
    dataElement: 'lesmis_fqs1_p_exp',
    label: 'Principal/head of school has at least 3 years experience in teaching',
  },
  {
    dataElement: 'lesmis_fqs1_t_qual',
    label:
      'All teacher have qualifications in area of teacher education - graduated middle level diploma in area of teacher education or above',
  },
  {
    dataElement: 'lesmis_fqs1_stuteachratio',
    label: 'Student teacher ratio: according to the allocation guidelines',
  },
  {
    dataElement: 'lesmis_fqs1_book_teachprofile',
    label: 'One (1) teacher profile book per school',
  },
  {
    dataElement: 'lesmis_fqs1_book_stureg',
    label: 'One (1) student registration record book per school',
  },
  { dataElement: 'lesmis_fqs1_book_s_lang', label: 'Each student has 1 textbook for Lao language' },
  { dataElement: 'lesmis_fqs1_book_s_math', label: 'Each student has 1 textbook for mathematics' },
  {
    dataElement: 'lesmis_fqs1_book_s_record',
    label: 'Each student has 1 record book for learning monitoring',
  },
  {
    dataElement: 'lesmis_fqs1_book_t_record',
    label: 'Teacher has 1 record book for student naming and scoring per class',
  },
  {
    dataElement: 'lesmis_fqs1_book_t_mathmat',
    label: 'Teacher has 1 set of materials for teaching and learning for mathematics',
  },
  {
    dataElement: 'lesmis_fqs1_book_t_lang',
    label: 'Teacher has 1 teacher guide book for language',
  },
  {
    dataElement: 'lesmis_fqs1_book_t_math',
    label: 'Teacher has 1 teacher guide book for mathematics',
  },
  {
    dataElement: 'lesmis_fqs1_book_curriculum',
    label: 'One (1) curriculum book per school',
  },
  { dataElement: 'lesmis_fqs1_book_accounting', label: 'One (1) accounting book per school' },
  {
    dataElement: 'lesmis_fqs1_book_propertyrecord',
    label: 'One (1) property record book per school',
  },
  { dataElement: 'lesmis_fqs1_book_emisform', label: 'One (1) EMIS form book per school' },
];
const FQS2_DATA_MAP = [
  {
    dataElement: 'lesmis_fqs2_01',
    label: 'SCHOOL OFFERS CLASSES ON EVERY DAY OF THE OFFICIAL SCHOOL YEAR (165 DAYS AS NORM)',
  },
  { dataElement: 'lesmis_fqs2_02', label: 'SCHOOLS HAS NO UNAUTHORIZED TEACHER ABSENTEEISM' },
  {
    dataElement: 'lesmis_fqs2_03',
    label: 'TEACHERS ONLY IN EXCEPTIONAL CASES COME LATE FOR CLASS OR FINISH CLASS EARLY',
  },
  {
    dataElement: 'lesmis_fqs2_04',
    label: 'SCHOOL KEEPS AN ACCURATE AND UP TO DATE SCHOOL FINANCIAL RECORD AND ASSETS REGISTER',
  },
  {
    dataElement: 'lesmis_fqs2_05',
    label:
      'SCHOOL HAS A CURRENT, COSTED SCHOOL DEVELOPMENT PLAN THAT IS DEVELOPED WITH ALL STAFF AND THE COMMUNITY AND USED TO MONITOR PROGRESS TOWARDS OBJECTIVES',
  },
  {
    dataElement: 'lesmis_fqs2_06',
    label:
      'CLASSROOMS AND SCHOOL GROUNDS ARE CLEAN, GARDENS AND TREES MAINTAINED, AND WELLS ARE PROTECTED FOR SAFETY',
  },
  {
    dataElement: 'lesmis_fqs2_07',
    label: 'WATER FACILITIES AND TOILETS ARE WORKING, CLEAN AND HAVE SOAP FOR HANDWASHING',
  },
  {
    dataElement: 'lesmis_fqs2_08',
    label:
      'ALL SCHOOL-AGED CHILDREN ARE ENROLLED AND PARTICIPATING, INCLUDING CHILDREN WITH DISABILITIES',
  },
  { dataElement: 'lesmis_fqs2_09', label: 'TEACHERS OF ALL GRADES PREPARE THEIR LESSONS' },
  {
    dataElement: 'lesmis_fqs2_10',
    label: 'TEACHERS COVER THE FULL CURRICULUM OVER THE SCHOOL YEAR',
  },
  {
    dataElement: 'lesmis_fqs2_11',
    label: 'TEACHERS HAVE GOOD KNOWLEDGE IN LAO LANGUAGE AND MATHEMATICS',
  },
  { dataElement: 'lesmis_fqs2_12', label: 'TEACHERS HAVE GOOD PEDAGOGICAL SKILLS' },
  {
    dataElement: 'lesmis_fqs2_13',
    label:
      'TEACHERS CORRECT STUDENTS WORK AND GIVE FEEDBACK ON THEIR STRENGTHS AND AREAS FOR IMPROVEMENT',
  },
  {
    dataElement: 'lesmis_fqs2_14',
    label: 'TEACHERS GIVE EXTRA SUPPORT TO STUDENTS WHO ARE NOT PROGRESSING WELL',
  },
  {
    dataElement: 'lesmis_fqs2_15',
    label: 'PARENTS RECEIVE REPORTS ON STUDENT PROGRESS ONCE EVERY MONTH',
  },
  {
    dataElement: 'lesmis_fqs2_16',
    label: 'TEACHERS MEET WITH PARENTS OF SLOW LEARNERS TO DISCUSS ACTIONS TO SUPPORT STUDENTS',
  },
  {
    dataElement: 'lesmis_fqs2_17',
    label:
      'TEACHERS HAVE A PROGRESS DISCUSSION WITH THEIR PRINCIPAL OR DEPUTY PRINCIPAL AT LEAST ONCE PER SEMESTER AND RECEIVE FEEDBACK TO IMPROVE THEIR PERFORMANCE',
  },
  {
    dataElement: 'lesmis_fqs2_18',
    label:
      'TEACHERS COLLABORATE TO IMPROVE THEIR TEACHING (E.G. JOINT LESSON PLANNING, OBSERVING EACH OTHER, TEAM TEACHING, ETC.) AT LEAST ONCE A MONTH',
  },
  { dataElement: 'lesmis_fqs2_19', label: 'STUDENTS ARE POLITE AND WELL BEHAVED' },
  {
    dataElement: 'lesmis_fqs2_20',
    label:
      'TEACHERS COLLABORATE AND SHARE KNOWLEDGE/GOOD PRACTICES (E.G. EFFECTIVE LESSON PLANS, MATERIALS) WITH OTHER CLUSTER SCHOOLS AT LEAST TWICE PER SEMESTER',
  },
  {
    dataElement: 'lesmis_fqs2_21',
    label:
      'THE SCHOOL PRINCIPAL COLLABORATES WITH COLLEAGUES IN OTHER CLUSTER SCHOOLS TO IMPROVE TEACHING AND LEARNING AT LEAST ONCE PER SEMESTER',
  },
  {
    dataElement: 'lesmis_fqs2_22',
    label:
      'PRINCIPAL ATTENDS VEDC MEETINGS TO DISCUSS PROGRESS IN SCHOOL DEVELOPMENT PLAN (AT LEAST 4 PER TIMES PER YEAR)',
  },
  {
    dataElement: 'lesmis_fqs2_23',
    label: 'VEDC SUPPORTS THE IMPLEMENTATION OF THE SCHOOL DEVELOPMENT PLAN',
  },
];

const FQS_PIE_CHART_FRONT_END = {
  type: 'chart',
  chartType: 'pie',
  valueType: 'fractionAndPercentage',
  presentationOptions: {
    Achieved: { color: '#02B851' }, // Green
    'Minor Issue': { color: '#ffc701' }, // Yellow
    'Major Issue': { color: '#D13333' }, // Red
  },
};
const FQS1_PIE_FRONT_END = {
  name: 'FQS Part 1 - Inputs Overview',
  ...FQS_PIE_CHART_FRONT_END,
};
const FQS2_PIE_FRONT_END = {
  name: 'FQS Part 2 - Behaviours and Processes Overview',
  ...FQS_PIE_CHART_FRONT_END,
};

const FQS1_LIST_FRONT_END = {
  name: 'FQS Part 1 - Inputs',
  type: 'list',
  valueType: 'color',
  listConfig: {
    'Major Issue': { color: '#D13333', label: 'Major Area for Improvement' }, // Red
    'Minor Issue': { color: '#ffc701', label: 'Minor Area for Improvement' }, // Yellow
    Achieved: { color: '#02B851', label: 'Achieved' }, // Green
  },
};
const FQS2_LIST_FRONT_END = {
  name: 'FQS Part 2 - Behaviours and Processes',
  type: 'list',
  valueType: 'color',
  listConfig: {
    3: { color: '#D13333', label: 'Major Area for Improvement' }, // Red
    2: { color: '#ffc701', label: 'Minor Area for Improvement' }, // Yellow
    1: { color: '#02B851', label: 'Achieved' }, // Green
  },
};

const FQS1_PIE_REPORT = {
  fetch: {
    dataElements: FQS1_DATA_MAP.map(data => data.dataElement),
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'count'": '1',
      '...': '*',
    },
    {
      transform: 'aggregate',
      value: 'group',
      count: 'sum',
      '...': 'last',
    },
    {
      transform: 'select',
      "'name'": '$row.value',
      "'value'": '$row.count/sum($all.count)',
      "'Achieved_metadata'":
        "eq($row.value, 'Achieved') ? { numerator: $row.count, denominator: sum($all.count) } : undefined",
      "'Minor Issue_metadata'":
        "eq($row.value, 'Minor Issue') ? { numerator: $row.count, denominator: sum($all.count) } : undefined",
      "'Major Issue_metadata'":
        "eq($row.value, 'Major Issue') ? { numerator: $row.count, denominator: sum($all.count) } : undefined",
    },
  ],
};
const FQS2_PIE_REPORT = {
  fetch: {
    dataElements: FQS2_DATA_MAP.map(data => data.dataElement),
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    {
      transform: 'select',
      "'count'": '1',
      '...': '*',
    },
    {
      transform: 'aggregate',
      value: 'group',
      count: 'sum',
      '...': 'last',
    },
    {
      transform: 'select',
      "'name'":
        "translate($row.value, { '1': 'Achieved', '2': 'Minor Issue', '3': 'Major Issue' })",
      "'value'": '$row.count/sum($all.count)',
      "'Achieved_metadata'":
        "eq($row.value, '1') ? { numerator: $row.count, denominator: sum($all.count) } : undefined",
      "'Minor Issue_metadata'":
        "eq($row.value, '2') ? { numerator: $row.count, denominator: sum($all.count) } : undefined",
      "'Major Issue_metadata'":
        "eq($row.value, '3') ? { numerator: $row.count, denominator: sum($all.count) } : undefined",
    },
  ],
};

const FQS_LIST_REPORT = dataMap => ({
  fetch: {
    dataElements: dataMap.map(data => data.dataElement),
    aggregations: [
      {
        type: 'MOST_RECENT',
      },
    ],
  },
  transform: [
    ...dataMap.map((data, index) => ({
      transform: 'select',
      where: `eq($row.dataElement, '${data.dataElement}')`,
      "'code'": `'${data.dataElement}'`,
      "'label'": `'${data.label}'`,
      "'sort_order'": `${index}`,
      "'statistic'": '$row.value',
    })),
    {
      transform: 'sort',
      by: '$row.sort_order',
    },
    {
      transform: 'select',
      '...': ['label', 'statistic', 'code'],
    },
  ],
});

const DASHBOARD_ITEMS = [
  {
    code: 'LESMIS_FQS1_inputs_overview',
    frontEndConfig: FQS1_PIE_FRONT_END,
    reportConfig: FQS1_PIE_REPORT,
  },
  {
    code: 'LESMIS_FQS1_inputs',
    frontEndConfig: FQS1_LIST_FRONT_END,
    reportConfig: FQS_LIST_REPORT(FQS1_DATA_MAP),
  },
  {
    code: 'LESMIS_FQS2_behaviours_and_processes_overview',
    frontEndConfig: FQS2_PIE_FRONT_END,
    reportConfig: FQS2_PIE_REPORT,
  },
  {
    code: 'LESMIS_FQS2_behaviours_and_processes',
    frontEndConfig: FQS2_LIST_FRONT_END,
    reportConfig: FQS_LIST_REPORT(FQS2_DATA_MAP),
  },
];

// Same util functions as always
const addNewDashboardItemAndReport = async (
  db,
  { code, frontEndConfig, reportConfig, permissionGroup, dashboardCode, entityTypes, projectCodes },
) => {
  // insert report
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

  // insert dashboard item
  const dashboardItemId = generateId();
  await insertObject(db, 'dashboard_item', {
    id: dashboardItemId,
    code,
    config: frontEndConfig,
    report_code: code,
  });

  // insert relation record connecting dashboard item to dashboard
  await addItemToDashboard(db, { code, dashboardCode, entityTypes, projectCodes, permissionGroup });
};

const addItemToDashboard = async (
  db,
  { code, dashboardCode, permissionGroup, entityTypes, projectCodes },
) => {
  const dashboardItemId = (await findSingleRecord(db, 'dashboard_item', { code })).id;
  const dashboardId = (await findSingleRecord(db, 'dashboard', { code: dashboardCode })).id;
  const maxSortOrder = (
    await findSingleRecordBySql(
      db,
      `SELECT max(sort_order) as max_sort_order FROM dashboard_relation WHERE dashboard_id = '${dashboardId}';`,
    )
  ).max_sort_order;
  await insertObject(db, 'dashboard_relation', {
    id: generateId(),
    dashboard_id: dashboardId,
    child_id: dashboardItemId,
    entity_types: `{${entityTypes.join(', ')}}`,
    project_codes: `{${projectCodes.join(', ')}}`,
    permission_groups: `{${permissionGroup}}`,
    sort_order: maxSortOrder + 1,
  });
};

const removeDashboardItemAndReport = async (db, code) => {
  await db.runSql(`DELETE FROM dashboard_item WHERE code = '${code}';`); // delete cascades to dashboard_relation
  await db.runSql(`DELETE FROM report WHERE code = '${code}';`);
};

exports.up = async function (db) {
  for (const { code, reportConfig, frontEndConfig } of DASHBOARD_ITEMS) {
    await addNewDashboardItemAndReport(db, {
      code,
      reportConfig,
      frontEndConfig,
      permissionGroup: 'LESMIS Public',
      dashboardCode: 'LA_FQS',
      entityTypes: ['school'],
      projectCodes: ['laos_schools'],
    });
  }
};

exports.down = async function (db) {
  for (const { code } of DASHBOARD_ITEMS) {
    await removeDashboardItemAndReport(db, code);
  }
};

exports._meta = {
  version: 1,
};
