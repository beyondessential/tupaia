import { MockTupaiaApiClient, MockCentralApi } from '@tupaia/api-client';
import { DataTableType } from '@tupaia/types';
import { DataTableServiceBuilder } from '../../../dataTableService';
import { CENTRAL_API_RESPONSES } from './fixtures';

const surveyResponseDataTableService = new DataTableServiceBuilder()
  .setServiceType(DataTableType.survey_responses)
  .setContext({
    apiClient: new MockTupaiaApiClient({ central: new MockCentralApi(CENTRAL_API_RESPONSES) }),
  })
  .build();

describe('SurveyResponsesDataTableService', () => {
  it('getParameters', () => {
    const parameters = surveyResponseDataTableService.getParameters();
    expect(parameters).toEqual([
      { config: { type: 'array', innerType: { type: 'string' } }, name: 'ids' },
      {
        config: { type: 'array', innerType: { type: 'string' } },
        name: 'assessorNames',
      },
      {
        config: { type: 'array', innerType: { type: 'string' } },
        name: 'countryCodes',
      },
      {
        config: { type: 'array', innerType: { type: 'string', required: true }, required: true },
        name: 'surveyCodes',
      },
      {
        config: { type: 'organisationUnitCodes', innerType: { type: 'string' } },
        name: 'entityCodes',
      },
      {
        config: { type: 'date' },
        name: 'startDate',
      },
      {
        config: { type: 'date' },
        name: 'endDate',
      },
      {
        config: { type: 'boolean' },
        name: 'outdated',
      },
    ]);
  });

  it('can fetch survey response results', async () => {
    const results = await surveyResponseDataTableService.fetchData({
      ids: ['1'],
      startDate: '2019-01-01',
      endDate: '2021-01-01',
      surveyCodes: ['survey1'],
    });

    expect(results).toEqual([CENTRAL_API_RESPONSES.surveyResponses[0]]);
  });
});
