/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { generateId } from '@tupaia/database';
import { convertPeriodStringToDateRange } from '@tupaia/utils';
import { ApiConnection } from './ApiConnection';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

const PSSS_SURVEY_RESPONSE_ANSWER_TYPE = 'Number'; // All survey response answers are 'Number' in PSSS

type SurveyResponseObject = {
  'entity.code': string;
  'survey.code': string;
  submission_time: string;
  id: string;
};

type AnswerObject = {
  'question.code': string;
  id: string;
};

export class MeditrakConnection extends ApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async findSurveyResponse(surveyCode: string, orgUnitCode: string, period: string) {
    const [startDate, endDate] = convertPeriodStringToDateRange(period);
    const results = (await this.get(`surveyResponses/`, {
      page: '0',
      pageSize: '1',
      columns: `["entity.code","survey.code","submission_time","id"]`,
      filter: JSON.stringify({
        'survey.code': { comparisonValue: surveyCode },
        'entity.code': { comparisonValue: orgUnitCode },
        submission_time: {
          comparator: 'BETWEEN',
          comparisonValue: [startDate, endDate],
          castAs: 'date',
        },
      }),
      sort: '["submission_time DESC"]',
    })) as SurveyResponseObject[];

    return results.length > 0 ? results[0] : undefined;
  }

  async updateSurveyResponse(
    surveyResponse: SurveyResponseObject,
    answers: Record<string, number>,
  ) {
    const existingAnswers = (await this.get(`surveyResponses/${surveyResponse.id}/answers`, {
      columns: `["question.code","id"]`,
    })) as AnswerObject[];

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
        payload: {
          id: surveyResponse.id,
          submission_time: surveyResponse.submission_time,
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
    answers: Record<string, number>,
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
        payload: {
          id: generateId(),
          submission_time: new Date(endDate).toISOString(),
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
    return this.delete(`surveyResponse/${surveyResponse.id}`);
  }
}
