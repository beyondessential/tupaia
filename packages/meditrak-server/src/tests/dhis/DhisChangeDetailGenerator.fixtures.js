export const ENTITY = 'entity';
export const ANSWER = 'answer';
export const SURVEY = 'survey';
export const SURVEY_RESPONSE = 'survey_response';

export const REGIONAL_SURVEY_RESPONSE = {
  id: 'survey_response_is_regional',
  survey_id: 'survey_is_regional',
  entity_id: 'demo_land',
};

export const TONGA_SURVEY_RESPONSE = {
  id: 'survey_response_is_not_regional',
  survey_id: 'survey_is_not_regional',
  entity_id: 'tonga_case_1',
};

const STUBBED_MODEL_DATA = {
  [SURVEY]: [
    {
      id: 'survey_is_regional',
      getIsDataForRegionalDhis2: () => true,
    },
    {
      id: 'survey_is_not_regional',
      getIsDataForRegionalDhis2: () => false,
    },
  ],
  [ENTITY]: [
    {
      id: 'demo_land',
      fetchClosestOrganisationUnit: () => ({ code: 'DL' }),
    },
    {
      id: 'tonga_case_1',
      fetchClosestOrganisationUnit: () => ({ code: 'TO_Tongatapu_Tofoa' }),
    },
  ],
  [SURVEY_RESPONSE]: [REGIONAL_SURVEY_RESPONSE, TONGA_SURVEY_RESPONSE],
};

const stubFind = type => ({ id: ids }) => STUBBED_MODEL_DATA[type].filter(r => ids.includes(r.id));

export const MODELS = {
  entity: {
    databaseType: ENTITY,
    find: stubFind(ENTITY),
  },
  surveyResponse: {
    databaseType: SURVEY_RESPONSE,
    find: stubFind(SURVEY_RESPONSE),
  },
  answer: {
    databaseType: ANSWER,
  },
  survey: {
    find: stubFind(SURVEY),
  },
};
