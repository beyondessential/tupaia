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
    label: 'School has water for use the whole year',
  },
  {
    dataElement: 'lesmis_fqs1_latrine',
    label: 'School has at least 2 latrines for normal use - 1 for girls and 1 for boys',
  },
  { dataElement: 'lesmis_fqs1_board', label: 'One (1) usable board per classroom' },
  { dataElement: 'lesmis_fqs1_map', label: 'One (1) Lao country map per classroom' },
  {
    dataElement: 'lesmis_fqs1_table',
    label: 'Classroom has a table for each student to use for study (100%)',
  },
  {
    dataElement: 'lesmis_fqs1_chair',
    label: 'Classroom has chairs for each student to use for study (100%)',
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
      'All teachers have qualifications in area of teacher education - graduated middle level diploma in area of teacher education or above',
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
    label: 'School offers classes every day of the official school year (165 days as norm)',
  },
  { dataElement: 'lesmis_fqs2_02', label: 'School has no unauthorized teacher absenteeism' },
  {
    dataElement: 'lesmis_fqs2_03',
    label: 'Teachers only in exceptional cases come late for class or finish class early',
  },
  {
    dataElement: 'lesmis_fqs2_04',
    label: 'School keeps an accurate and up to date school financial record and assets register',
  },
  {
    dataElement: 'lesmis_fqs2_05',
    label:
      'School has a current, costed school development plan that is developed with all staff and the community and used to monitor progress towards objectives',
  },
  {
    dataElement: 'lesmis_fqs2_06',
    label:
      'Classrooms and school grounds are clean, gardens and trees maintained, and wells are protected for safety',
  },
  {
    dataElement: 'lesmis_fqs2_07',
    label: 'Water facilities and toilets are working, clean and have soap for handwashing',
  },
  {
    dataElement: 'lesmis_fqs2_08',
    label:
      'All school-aged children are enrolled and participating, including children with disabilities',
  },
  { dataElement: 'lesmis_fqs2_09', label: 'Teachers of all grades prepare their lessons' },
  {
    dataElement: 'lesmis_fqs2_10',
    label: 'Teachers cover the full curriculum over the school year',
  },
  {
    dataElement: 'lesmis_fqs2_11',
    label: 'Teachers have good knowledge in Lao language and mathematics',
  },
  { dataElement: 'lesmis_fqs2_12', label: 'Teachers have good pedagogical skills' },
  {
    dataElement: 'lesmis_fqs2_13',
    label:
      'Teachers correct students work and give feedback on their strengths and areas for improvement',
  },
  {
    dataElement: 'lesmis_fqs2_14',
    label: 'Teachers give extra support to students who are not progressing well',
  },
  {
    dataElement: 'lesmis_fqs2_15',
    label: 'Parents receive reports on student progress once every month',
  },
  {
    dataElement: 'lesmis_fqs2_16',
    label: 'Teachers meet with parents of slow learners to discuss actions to support students',
  },
  {
    dataElement: 'lesmis_fqs2_17',
    label:
      'Teachers have a progress discussion with their principal or deputy principal at least once per semester and receive feedback to improve their performance',
  },
  {
    dataElement: 'lesmis_fqs2_18',
    label:
      'Teachers collaborate to improve their teaching (e.g. joint lesson planning, observing each other, team teaching, etc.) at least once a month',
  },
  { dataElement: 'lesmis_fqs2_19', label: 'Students are polite and well behaved' },
  {
    dataElement: 'lesmis_fqs2_20',
    label:
      'Teachers collaborate and share knowledge/good practices (e.g. effective lesson plans, materials) with other cluster schools at least twice per semester',
  },
  {
    dataElement: 'lesmis_fqs2_21',
    label:
      'The school principal collaborates with colleagues in other cluster schools to improve teaching and learning at least once per semester',
  },
  {
    dataElement: 'lesmis_fqs2_22',
    label:
      'Principal attends VEDC meetings to discuss progress in school development plan (at least 4 times per year)',
  },
  {
    dataElement: 'lesmis_fqs2_23',
    label: 'VEDC supports the implementation of the school development plan',
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
