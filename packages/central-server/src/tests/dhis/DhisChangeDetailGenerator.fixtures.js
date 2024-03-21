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
      data_group_id: 'survey_is_regional_dataGroup',
    },
    {
      id: 'survey_is_not_regional',
      data_group_id: 'survey_is_not_regional_dataGroup',
    },
  ],
  data_group: [
    {
      id: 'survey_is_regional_dataGroup',
      config: { dhisInstanceCode: 'regional' },
    },
    {
      id: 'survey_is_not_regional_dataGroup',
      config: { dhisInstanceCode: null },
    },
  ],
  entity: [
    {
      id: 'demo_land',
      fetchNearestOrgUnitAncestor: () => ({ code: 'DL' }),
    },
    {
      id: 'tonga_case_1',
      fetchNearestOrgUnitAncestor: () => ({ code: 'TO_Tongatapu_Tofoa' }),
    },
  ],
  survey_response: [REGIONAL_SURVEY_RESPONSE, TONGA_SURVEY_RESPONSE],
};

const stubFind =
  type =>
  async ({ id: ids }) =>
    STUBBED_MODEL_DATA[type].filter(r => ids.includes(r.id));

export const MODELS = {
  entity: {
    databaseRecord: 'entity',
    find: stubFind('entity'),
  },
  surveyResponse: {
    databaseRecord: 'survey_response',
    find: stubFind('survey_response'),
  },
  answer: {
    databaseRecord: 'answer',
  },
  survey: {
    find: stubFind('survey'),
  },
  database: {
    find: sinon
      .stub()
      .withArgs('survey', sinon.match({ 'survey.id': sinon.match.array }), {
        joinWith: 'data_group',
        joinCondition: ['data_group.id', 'survey.data_group.id'],
        columns: ['survey.id', 'data_group.config'],
      })
      .callsFake(async (t, { 'survey.id': surveyIds }) =>
        surveyIds.map(surveyId => {
          const find = (type, targetId) =>
            STUBBED_MODEL_DATA[type].find(({ id }) => id === targetId);

          const survey = find('survey', surveyId);
          const dataSource = find('data_group', survey.data_group_id);
          return { id: survey.id, config: dataSource.config };
        }),
      ),
  },
};
