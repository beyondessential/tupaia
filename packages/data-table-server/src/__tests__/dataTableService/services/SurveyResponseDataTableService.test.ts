/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { MockTupaiaApiClient, MockCentralApi } from '@tupaia/api-client';
import { DataTableType } from '@tupaia/types';
import { DataTableServiceBuilder } from '../../../dataTableService';
import { getDefaultEndDate, getDefaultStartDate } from '../../../dataTableService/services/utils';
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
      { config: { defaultValue: [], type: 'array', innerType: { type: 'string' } }, name: 'ids' },
      {
        config: { defaultValue: [], type: 'array', innerType: { type: 'string' } },
        name: 'assessorNames',
      },
      {
        config: { defaultValue: [], type: 'array', innerType: { type: 'string' } },
        name: 'countryCodes',
      },
      {
        config: { defaultValue: [], type: 'array', innerType: { type: 'string' } },
        name: 'surveyCodes',
      },
      {
        config: { defaultValue: [], type: 'organisationUnitCodes', innerType: { type: 'string' } },
        name: 'entityCodes',
      },
      {
        config: { defaultValue: getDefaultStartDate(), type: 'date' },
        name: 'startDate',
      },
      {
        config: { defaultValue: getDefaultEndDate(), type: 'date' },
        name: 'endDate',
      },
      {
        config: { defaultValue: false, type: 'boolean' },
        name: 'outdated',
      },
    ]);
  });

  it('can fetch survey response results', async () => {
    const results = await surveyResponseDataTableService.fetchData({
      ids: ['1'],
      startDate: '2019-01-01',
      endDate: '2021-01-01',
    });

    expect(results).toEqual([CENTRAL_API_RESPONSES.surveyResponses[0]]);
  });
});
