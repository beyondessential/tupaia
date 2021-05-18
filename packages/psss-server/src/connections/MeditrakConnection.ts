/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { convertPeriodStringToDateRange, stripTimezoneFromDate } from '@tupaia/utils';
import { ApiConnection } from './ApiConnection';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

const PSSS_SURVEY_RESPONSE_ANSWER_TYPE = 'Number'; // All survey response answers are 'Number' in PSSS

type SurveyResponseObject = {
  'entity.code': string;
  'survey.code': string;
  data_time: string;
  id: string;
};

type AnswerObject = {
  'question.code': string;
  id: string;
};

type Answers = Record<string, string | number>;

export class MeditrakConnection extends ApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async updateOrCreateSurveyResponse(
    surveyCode: string,
    orgUnitCode: string,
    period: string,
    answers: Answers,
  ) {
    const existingSurveyResponse = await this.findSurveyResponse(surveyCode, orgUnitCode, period);

    if (existingSurveyResponse) {
      return this.updateSurveyResponse(existingSurveyResponse, answers);
    }

    return this.createSurveyResponse(surveyCode, orgUnitCode, period, answers);
  }

  async findSurveyResponses(
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

  async findSurveyResponseById(surveyResponseId: string) {
    return this.get(`surveyResponses/${surveyResponseId}`, {
      columns: `["entity.code","survey.code","data_time","id"]`,
    });
  }

  async findSurveyResponse(surveyCode: string, orgUnitCode: string, period: string) {
    const results = await this.findSurveyResponses(surveyCode, orgUnitCode, period, '1');
    return results.length > 0 ? results[0] : undefined;
  }

  async findAnswers(surveyResponse: SurveyResponseObject) {
    return (await this.get(`surveyResponses/${surveyResponse.id}/answers`, {
      columns: `["question.code","id"]`,
    })) as AnswerObject[];
  }

  async updateSurveyResponse(surveyResponse: SurveyResponseObject, answers: Answers) {
    const existingAnswers = await this.findAnswers(surveyResponse);
    const newAnswers = existingAnswers.map(existingAnswer => {
      const questionCode = existingAnswer['question.code'];
      return {
        id: existingAnswer.id,
        type: PSSS_SURVEY_RESPONSE_ANSWER_TYPE,
        question_code: questionCode,
        body: answers[questionCode],
      };
    });
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

  async createSurveyResponse(
    surveyCode: string,
    organisationUnitCode: string,
    period: string,
    answers: Answers,
    surveyResponseId?: string | undefined,
  ) {
    const [_, endDate] = convertPeriodStringToDateRange(period);

    const newAnswers = Object.entries(answers).map(([questionCode, value]) => ({
      id: generateId(),
      type: PSSS_SURVEY_RESPONSE_ANSWER_TYPE,
      question_code: questionCode,
      body: value,
    }));

    const date = new Date().toISOString();

    return this.post(`changes`, {}, [
      {
        action: 'SubmitSurveyResponse',
        waitForAnalyticsRebuild: true,
        payload: {
          id: surveyResponseId || generateId(),
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
  }

  async deleteSurveyResponse(surveyResponse: SurveyResponseObject) {
    return this.delete(`surveyResponses/${surveyResponse.id}`, { waitForAnalyticsRebuild: 'true' });
  }
}
