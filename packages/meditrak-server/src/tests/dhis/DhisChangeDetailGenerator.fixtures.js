import sinon from 'sinon';

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
  survey: [
    {
      id: 'survey_is_regional',
      data_source_id: 'survey_is_regional_dataGroup',
    },
    {
      id: 'survey_is_not_regional',
      data_source_id: 'survey_is_not_regional_dataGroup',
    },
  ],
  data_source: [
    {
      id: 'survey_is_regional_dataGroup',
      config: { isDataRegional: true },
    },
    {
      id: 'survey_is_not_regional_dataGroup',
      config: { isDataRegional: false },
    },
  ],
  entity: [
    {
      id: 'demo_land',
      fetchClosestOrganisationUnit: () => ({ code: 'DL' }),
    },
    {
      id: 'tonga_case_1',
      fetchClosestOrganisationUnit: () => ({ code: 'TO_Tongatapu_Tofoa' }),
    },
  ],
  survey_response: [REGIONAL_SURVEY_RESPONSE, TONGA_SURVEY_RESPONSE],
};

const stubFind = type => async ({ id: ids }) =>
  STUBBED_MODEL_DATA[type].filter(r => ids.includes(r.id));

export const MODELS = {
  entity: {
    databaseType: 'entity',
    find: stubFind('entity'),
  },
  surveyResponse: {
    databaseType: 'survey_response',
    find: stubFind('survey_response'),
  },
  answer: {
    databaseType: 'answer',
  },
  survey: {
    find: stubFind('survey'),
  },
  database: {
    find: sinon
      .stub()
      .withArgs('survey', sinon.match({ 'survey.id': sinon.match.array }), {
        joinWith: 'data_source',
        joinCondition: ['data_source.id', 'survey.data_source.id'],
        columns: ['survey.id', 'data_source.config'],
      })
      .callsFake(async (t, { 'survey.id': surveyIds }) =>
        surveyIds.map(surveyId => {
          const find = (type, targetId) =>
            STUBBED_MODEL_DATA[type].find(({ id }) => id === targetId);

          const survey = find('survey', surveyId);
          const dataSource = find('data_source', survey.data_source_id);
          return { id: survey.id, config: dataSource.config };
        }),
      ),
  },
};
