const FQS1_ANSWER_MAP = {
  0: 'Major Issue',
  50: 'Minor Issue',
  100: 'Achieved',
};

const FQS2_ANSWER_MAP = {
  0: 3,
  50: 2,
  100: 1,
};

export const FQS1_CODE_MAPPING = {
  lesmis_school: { koboQuestionCode: 'FQS1Primary_location/FQS1PrimarySchool' },

  lesmis_fqs1_stdbuilding: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q1',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_stdbuilding_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q1Comment' },
  lesmis_fqs1_office: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q2',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_office_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q2Comment' },
  lesmis_fqs1_cabinet: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q3',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_cabinet_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q3Comment' },
  lesmis_fqs1_water: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q4',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_water_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q4Comment' },
  lesmis_fqs1_latrine: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q5',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_latrine_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q5Comment' },
  lesmis_fqs1_board: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q6',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_board_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q6Comment' },
  lesmis_fqs1_map: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q7',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_map_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q7Comment' },
  lesmis_fqs1_table: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q8',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_table_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q8Comment' },
  lesmis_fqs1_chair: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q9',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_chair_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q9Comment' },
  lesmis_fqs1_t_tablechair: {
    koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q10',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_t_tablechair_c: { koboQuestionCode: 'FQS1PrimaryPart1/FQS1PrimaryPart1Q10Comment' },

  lesmis_fqs1_p_qual: {
    koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q1',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_p_qual_c: { koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q1Comment' },
  lesmis_fqs1_p_exp: {
    koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q2',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_p_exp_c: { koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q2Comment' },
  lesmis_fqs1_t_qual: {
    koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q3',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_t_qual_c: { koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q3Comment' },
  lesmis_fqs1_stuteachratio: {
    koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q4',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_stuteachratio_c: { koboQuestionCode: 'FQS1PrimaryPart2/FQS1PrimaryPart2Q4Comment' },

  lesmis_fqs1_book_teachprofile: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q1',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_teachprofile_c: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q1Comment',
  },
  lesmis_fqs1_book_stureg: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q2',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_stureg_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q2Comment' },
  lesmis_fqs1_book_s_lang: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q3',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_s_lang_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q3Comment' },
  lesmis_fqs1_book_s_math: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q4',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_s_math_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q4Comment' },
  lesmis_fqs1_book_s_record: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q6',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_s_record_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q6Comment' },
  lesmis_fqs1_book_t_record: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q7',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_t_record_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q7Comment' },
  lesmis_fqs1_book_t_mathmat: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q8',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_t_mathmat_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q8Comment' },
  lesmis_fqs1_book_t_lang: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q9',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_t_lang_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q9Comment' },
  lesmis_fqs1_book_t_math: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q10',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_t_math_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q10Comment' },
  lesmis_fqs1_book_curriculum: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q12',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_curriculum_c: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q12Comment',
  },
  lesmis_fqs1_book_accounting: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q13',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_accounting_c: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q13Comment',
  },
  lesmis_fqs1_book_propertyrecord: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q14',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_propertyrecord_c: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q14Comment',
  },
  lesmis_fqs1_book_emisform: {
    koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q15',
    answerMap: FQS1_ANSWER_MAP,
  },
  lesmis_fqs1_book_emisform_c: { koboQuestionCode: 'FQS1PrimaryPart3/FQS1PrimaryPart3Q15Comment' },
};

export const FQS2_CODE_MAPPING = {
  lesmis_school: { koboQuestionCode: 'FQS2Primary_location/FQS2PrimarySchool' },

  lesmis_fqs2_01: {
    koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q1',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_01_c: { koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q1Comment' },
  lesmis_fqs2_02: {
    koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q2',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_02_c: { koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q2Comment' },
  lesmis_fqs2_03: {
    koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q3',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_03_c: { koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q3Comment' },
  lesmis_fqs2_04: {
    koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q4',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_04_c: { koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q4Comment' },
  lesmis_fqs2_05: {
    koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q5',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_05_c: { koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q5Comment' },
  lesmis_fqs2_06: {
    koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q6',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_06_c: { koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q6Comment' },
  lesmis_fqs2_07: {
    koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q7',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_07_c: { koboQuestionCode: 'FQS2PrimaryPart1/FQS2PrimaryPart1Q7Comment' },

  lesmis_fqs2_08: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q1',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_08_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q1Comment' },
  lesmis_fqs2_09: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q2',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_09_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q2Comment' },
  lesmis_fqs2_10: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q3',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_10_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q3Comment' },
  lesmis_fqs2_11: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q4',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_11_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q4Comment' },
  lesmis_fqs2_12: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q5',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_12_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q5Comment' },
  lesmis_fqs2_13: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q6',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_13_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q6Comment' },
  lesmis_fqs2_14: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q7',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_14_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q7Comment' },
  lesmis_fqs2_15: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q8',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_15_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q8Comment' },
  lesmis_fqs2_16: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q9',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_16_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q9Comment' },
  lesmis_fqs2_17: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q10',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_17_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q10Comment' },
  lesmis_fqs2_18: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q11',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_18_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q11Comment' },
  lesmis_fqs2_19: {
    koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q12',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_19_c: { koboQuestionCode: 'FQS2PrimaryPart2/FQS2PrimaryPart2Q12Comment' },

  lesmis_fqs2_20: {
    koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q1',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_20_c: { koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q1Comment' },
  lesmis_fqs2_21: {
    koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q2',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_21_c: { koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q2Comment' },
  lesmis_fqs2_22: {
    koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q3',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_22_c: { koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q3Comment' },
  lesmis_fqs2_23: {
    koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q4',
    answerMap: FQS2_ANSWER_MAP,
  },
  lesmis_fqs2_23_c: { koboQuestionCode: 'FQS2PrimaryPart3/FQS2PrimaryPart3Q4Comment' },
};
