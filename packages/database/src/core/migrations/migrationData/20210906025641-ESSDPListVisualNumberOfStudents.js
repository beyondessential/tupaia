export const NEW_TRANSFORM_STEPS = [
  'keyValueByDataElementName',
  {
    transform: 'select',
    where: 'exists($row.er_summary_ece_0_2_t)',
    "'code'": "'ECETarget0_2'",
    "'label'":
      "'TARGET: Enrolment rate of 0-2 years old children: gender, GPI, total – 2025 target of 7%'",
    "'statistic'": '$row.er_summary_ece_0_2_t',
    "'sort_order'": '0',
    "'parent'": "'IO1_1'",
  },
  // NEW STEP
  {
    transform: 'select',
    where: 'exists($row.er_summary_ece_3_4_t)',
    "'code'": "'ECETarget3_4'",
    "'label'": "'Enrolment rate of 3-4 years old children: gender, GPI, total (No 2025 target)*'",
    "'statistic'": '$row.er_summary_ece_3_4_t',
    "'sort_order'": '1',
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'select',
    where: 'exists($row.er_summary_ece_5_t)',
    "'code'": "'ECETarget5'",
    "'label'":
      "'TARGET: Enrolment rate of 5-year-old children: gender, GPI, total – 2025 target of 86%'",
    "'statistic'": '$row.er_summary_ece_5_t',
    "'sort_order'": '2',
    "'parent'": "'IO1_1'",
  },
  // NEW STEP
  {
    transform: 'select',
    where: 'exists($row.nostu_ece_summary)',
    "'code'": "'numberOfStudents'",
    "'label'": "'Number of Students: Gender, GPI, Total, in public schools, private'",
    "'statistic'": '$row.nostu_ece_summary',
    "'parent'": "'IO1_1'",
    "'sort_order'": '3',
  },
  {
    transform: 'sort',
    by: '$row.sort_order',
  },
  {
    transform: 'select',
    '...': ['label', 'statistic', 'parent', 'code'],
  },
  // DELETED ECETarget3_4 STEP FROM HERE
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy5'",
    "'label'":
      "'Strategy 5: Encourage individuals, organizations, local and international investors to invest in ECE development.'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy4'",
    "'label'":
      "'Strategy 4: Expansion of WASH facilities and program at ECE level, particularly for girls and children with disabilities'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy3'",
    "'label'":
      "'Strategy 3: Development of a sustainable and cost-effective (human and financial resourcing) targeted ECE school meals strategy and action plan'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy2'",
    "'label'":
      "'Strategy 2: Scaling up of proven innovations/pilots for 3-5-year olds, with priority on programmes for 5-year olds, such as multi-age teaching (more research may be needed)'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy1'",
    "'label'":
      "'Strategy 1: Prioritised and targeted expansion of the one-year pre-primary program subject to quality improvements to provide more access in smaller villages from more disadvantaged areas.'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'IO1_1'",
    "'label'": "'IO 1.1: Increased access to quality ECE (Part I HLO 1, IOs 1.2 and 1.3)'",
    "'parent'": "'HLO1'",
    "'statistic'":
      'eq(max($where(f($otherRow) = equalText($otherRow.parent, "IO1_1")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "IO1_1")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "IO1_1")).statistic) : 0',
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'HLO1'",
    "'label'":
      "'HLO 1: Increased number of ECE graduates with improved primary school readiness, particularly literacy and numeracy skills with special focus on disadvantaged and gender equity'",
    "'statistic'":
      'eq(max($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic) : 0',
  },
];

export const OLD_TRANSFORM_STEPS = [
  'keyValueByDataElementName',
  {
    transform: 'select',
    where: 'exists($row.er_summary_ece_0_2_t)',
    "'code'": "'ECETarget0_2'",
    "'label'":
      "'TARGET: Enrolment rate of 0-2 years old children: gender, GPI, total – 2025 target of 7%'",
    "'statistic'": '$row.er_summary_ece_0_2_t',
    "'sort_order'": '0',
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'select',
    where: 'exists($row.er_summary_ece_5_t)',
    "'code'": "'ECETarget5'",
    "'label'":
      "'TARGET: Enrolment rate of 5-year-old children: gender, GPI, total – 2025 target of 86%'",
    "'statistic'": '$row.er_summary_ece_5_t',
    "'sort_order'": '1',
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'sort',
    by: '$row.sort_order',
  },
  {
    transform: 'select',
    '...': ['label', 'statistic', 'parent', 'code'],
  },
  {
    transform: 'insert',
    where: 'eq($index, 1)',
    "'code'": "'ECETarget3_4'",
    "'label'": "'Enrolment rate of 3-4 years old children: gender, GPI, total (No 2025 target)*'",
    "'statistic'": '1',
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy5'",
    "'label'":
      "'Strategy 5: Encourage individuals, organizations, local and international investors to invest in ECE development.'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy4'",
    "'label'":
      "'Strategy 4: Expansion of WASH facilities and program at ECE level, particularly for girls and children with disabilities'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy3'",
    "'label'":
      "'Strategy 3: Development of a sustainable and cost-effective (human and financial resourcing) targeted ECE school meals strategy and action plan'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy2'",
    "'label'":
      "'Strategy 2: Scaling up of proven innovations/pilots for 3-5-year olds, with priority on programmes for 5-year olds, such as multi-age teaching (more research may be needed)'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'Strategy1'",
    "'label'":
      "'Strategy 1: Prioritised and targeted expansion of the one-year pre-primary program subject to quality improvements to provide more access in smaller villages from more disadvantaged areas.'",
    "'parent'": "'IO1_1'",
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'IO1_1'",
    "'label'": "'IO 1.1: Increased access to quality ECE (Part I HLO 1, IOs 1.2 and 1.3)'",
    "'parent'": "'HLO1'",
    "'statistic'":
      'eq(max($where(f($otherRow) = equalText($otherRow.parent, "IO1_1")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "IO1_1")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "IO1_1")).statistic) : 0',
  },
  {
    transform: 'insert',
    position: 'before',
    where: 'eq($index, 1)',
    "'code'": "'HLO1'",
    "'label'":
      "'HLO 1: Increased number of ECE graduates with improved primary school readiness, particularly literacy and numeracy skills with special focus on disadvantaged and gender equity'",
    "'statistic'":
      'eq(max($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic), min($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic)) ? last($where(f($otherRow) = equalText($otherRow.parent, "HLO1")).statistic) : 0',
  },
];
