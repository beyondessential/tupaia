/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { convertPeriodStringToDateRange, stripTimezoneFromDate } from '@tupaia/utils';
import { Entity, Survey } from '@tupaia/types';
import { ApiConnection } from './ApiConnection';

const { CENTRAL_API_URL = 'http://localhost:8090/v2' } = process.env;

type SurveyResponseObject = {
  'entity.code': string;
  'survey.code': string;
  data_time: string;
  id: string;
};

type Answer = {
  code: string;
  value: string | number;
};

/**
 * @deprecated use @tupaia/api-client
 */
export class CentralConnection extends ApiConnection {
  public baseUrl = CENTRAL_API_URL;

  public async updateOrCreateSurveyResponse(
    surveyCode: string,
    orgUnitCode: string,
    period: string,
    answers: Answer[],
  ) {
    const existingSurveyResponse = await this.findSurveyResponse(surveyCode, orgUnitCode, period);

    if (existingSurveyResponse) {
      return this.updateSurveyResponseByObject(existingSurveyResponse, answers);
    }

    return this.createSurveyResponse(surveyCode, orgUnitCode, period, answers);
  }

  private async findSurveyResponses(
    surveyCode: string,
    orgUnitCode: string,
    period: string,
    pageSize?: string | undefined,
  ) {
    const [startDate, endDate] = convertPeriodStringToDateRange(period);
    return (await this.get(`surveyResponses/`, {
      page: '0',
      pageSize,
      columns: `["entity.code","survey.code","data_time","id"]`,
      filter: JSON.stringify({
        'survey.code': { comparisonValue: surveyCode },
        'entity.code': { comparisonValue: orgUnitCode },
        data_time: {
          comparator: 'BETWEEN',
          comparisonValue: [startDate, endDate],
          castAs: 'date',
        },
      }),
      sort: '["data_time DESC"]',
    })) as SurveyResponseObject[];
  }

  public async findSurveyResponse(surveyCode: string, orgUnitCode: string, period: string) {
    const results = await this.findSurveyResponses(surveyCode, orgUnitCode, period, '1');
    return results.length > 0 ? results[0] : undefined;
  }

  public async findSurveyResponseById(surveyResponseId: string) {
    return this.get(`surveyResponses/${surveyResponseId}`, {
      columns: `["entity.code","survey.code","data_time","id"]`,
    });
  }

  private async findSurvey(surveyCode: string): Promise<Pick<Survey, 'code' | 'id'> | undefined> {
    const surveys = await this.get(`surveys`, {
      filter: JSON.stringify({
        code: { comparisonValue: surveyCode },
      }),
      columns: `["code","id"]`,
    });
    return surveys.length > 0 ? surveys[0] : undefined;
  }

  private async findEntity(entityCode: string): Promise<Pick<Entity, 'code' | 'id'> | undefined> {
    const entities = await this.get(`entities`, {
      filter: JSON.stringify({
        code: { comparisonValue: entityCode },
      }),
      columns: `["code","id"]`,
    });
    return entities.length > 0 ? entities[0] : undefined;
  }

  public async updateSurveyResponse(
    id: string,
    entityCode: string,
    surveyCode: string,
    period: string,
    answers: Answer[],
  ) {
    const [, endDate] = convertPeriodStringToDateRange(period);
    const surveyResponse = {
      id,
      'entity.code': entityCode,
      'survey.code': surveyCode,
      data_time: stripTimezoneFromDate(new Date(endDate).toISOString()),
    };

    return this.updateSurveyResponseByObject(surveyResponse, answers);
  }

  public async updateSurveyResponseByObject(
    surveyResponse: SurveyResponseObject,
    answers: Answer[],
  ) {
    const newAnswers = Object.fromEntries(answers.map(({ code, value }) => [code, value]));
    const currentDate = new Date().toISOString();

    return this.post(
      `surveyResponse/${surveyResponse.id}/resubmit`,
      {
        waitForAnalyticsRebuild: 'true',
      },
      {
        start_time: currentDate,
        end_time: currentDate,
        answers: newAnswers,
      },
    );
  }

  public async createSurveyResponse(
    surveyCode: string,
    organisationUnitCode: string,
    period: string,
    answers: Answer[],
  ) {
    const [, endDate] = convertPeriodStringToDateRange(period);

    const newAnswers = Object.fromEntries(answers.map(({ code, value }) => [code, value]));

    const survey = await this.findSurvey(surveyCode);
    const entity = await this.findEntity(organisationUnitCode);

    const date = new Date().toISOString();
    const surveyResponseId = generateId();
    const response = await this.post(
      `surveyResponse`,
      {
        waitForAnalyticsRebuild: 'true',
      },
      [
        {
          id: surveyResponseId,
          data_time: stripTimezoneFromDate(new Date(endDate).toISOString()),
          survey_id: survey?.id,
          entity_code: organisationUnitCode,
          entity_id: entity?.id,
          user_email: this.authHandler.email,
          start_time: date,
          end_time: date,
          timestamp: date,
          answers: newAnswers,
        },
      ],
    );

    return { surveyResponseId, ...response };
  }

  public async deleteSurveyResponse(surveyResponseId: string) {
    return this.delete(`surveyResponses/${surveyResponseId}`, { waitForAnalyticsRebuild: 'true' });
  }
}
