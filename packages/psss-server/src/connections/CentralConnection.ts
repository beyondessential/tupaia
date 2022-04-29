/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { convertPeriodStringToDateRange, stripTimezoneFromDate } from '@tupaia/utils';
import { ApiConnection } from './ApiConnection';

const { CENTRAL_API_URL = 'http://localhost:8090/v2' } = process.env;

type SurveyResponseObject = {
  'entity.code': string;
  'survey.code': string;
  data_time: string;
  id: string;
};

type AnswerObject = {
  'question.code': string;
  type: string;
  id: string;
};

type Answer = {
  type: string;
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

  private async findAnswers(surveyResponseId: string) {
    return (await this.get(`surveyResponses/${surveyResponseId}/answers`, {
      columns: `["question.code","type","id"]`,
    })) as AnswerObject[];
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
    const existingAnswers = await this.findAnswers(surveyResponse.id);
    const newAnswers = existingAnswers
      .map(existingAnswer => {
        const questionCode = existingAnswer['question.code'];
        const answer = answers.find(a => a.code === questionCode);
        return {
          id: existingAnswer.id,
          type: existingAnswer.type,
          question_code: questionCode,
          body: answer?.value,
        };
      })
      .filter(a => a.body !== undefined);

    const currentDate = new Date().toISOString();

    return this.post(`changes`, {}, [
      {
        action: 'SubmitSurveyResponse',
        waitForAnalyticsRebuild: true,
        payload: {
          id: surveyResponse.id,
          data_time: surveyResponse.data_time,
          entity_code: surveyResponse['entity.code'],
          survey_code: surveyResponse['survey.code'],
          user_email: this.authHandler.email,
          start_time: currentDate,
          end_time: currentDate,
          answers: newAnswers,
        },
      },
    ]);
  }

  public async createSurveyResponse(
    surveyCode: string,
    organisationUnitCode: string,
    period: string,
    answers: Answer[],
  ) {
    const [, endDate] = convertPeriodStringToDateRange(period);

    const newAnswers = answers.map(({ type, code, value }) => ({
      id: generateId(),
      type,
      question_code: code,
      body: value,
    }));

    const date = new Date().toISOString();
    const surveyResponseId = generateId();
    const response = await this.post(`changes`, {}, [
      {
        action: 'SubmitSurveyResponse',
        waitForAnalyticsRebuild: true,
        payload: {
          id: surveyResponseId,
          data_time: stripTimezoneFromDate(new Date(endDate).toISOString()),
          survey_code: surveyCode,
          entity_code: organisationUnitCode,
          user_email: this.authHandler.email,
          start_time: date,
          end_time: date,
          answers: newAnswers,
        },
      },
    ]);

    return { surveyResponseId, ...response };
  }

  public async deleteSurveyResponse(surveyResponseId: string) {
    return this.delete(`surveyResponses/${surveyResponseId}`, { waitForAnalyticsRebuild: 'true' });
  }
}
