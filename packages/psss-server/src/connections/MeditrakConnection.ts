/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ApiConnection } from './ApiConnection';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

const SURVEY_RESPONSE_FIELDS = <const>['entity.code', 'survey.code', 'submission_time', 'id'];
const ANSWER_FIELDS = <const>['question.code', 'question_id', 'type', 'id'];

type SurveyResponseObject = {
  [key in typeof SURVEY_RESPONSE_FIELDS[number]]: string;
};

type AnswerObject = {
  [key in typeof ANSWER_FIELDS[number]]: string;
};

export class MeditrakConnection extends ApiConnection {
  baseUrl = MEDITRAK_API_URL;

  async findSurveyResponse(surveyCode: string, orgUnitCode: string, period: string) {
    const [year, week] = period.split('W');
    const [startDate, endDate] = startAndEndDateOfWeek(parseInt(week), parseInt(year));
    const results = (await this.get(`surveyResponses/`, {
      page: '0',
      pageSize: '1',
      columns: `["${SURVEY_RESPONSE_FIELDS.join('","')}"]`,
      filter: JSON.stringify({
        'survey.code': { comparisonValue: surveyCode, castAs: 'text' },
        'entity.code': { comparisonValue: orgUnitCode, castAs: 'text' },
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
    answers: Record<string, string>,
  ) {
    const existingAnswers = (await this.get(`surveyResponses/${surveyResponse.id}/answers`, {
      columns: `["${ANSWER_FIELDS.join('","')}"]`,
    })) as AnswerObject[];

    const newAnswers = existingAnswers.map(existingAnswer => ({
      ...existingAnswer,
      body: answers[existingAnswer['question.code']],
    }));
    const date = new Date().toISOString();

    return this.post(`changes`, {}, [
      {
        action: 'SubmitSurveyResponse',
        payload: {
          id: surveyResponse.id,
          submission_time: surveyResponse.submission_time,
          entity_code: surveyResponse['entity.code'],
          survey_code: surveyResponse['survey.code'],
          user_email: this.authHandler.email,
          start_time: date,
          end_time: date,
          answers: newAnswers,
        },
      },
    ]);
  }

  async createSurveyResponse(surveyCode: string, answers: Record<string, string>) {
    const existingAnswers = (await this.get(`surveyResponses/${surveyResponse.id}/answers`, {
      columns: `["${ANSWER_FIELDS.join('","')}"]`,
    })) as AnswerObject[];

    const newAnswers = existingAnswers.map(existingAnswer => ({
      ...existingAnswer,
      body: answers[existingAnswer['question.code']],
    }));

    return this.post(
      `changes`,
      {},
      {
        action: 'SubmitSurveyResponse',
        payload: {
          id: surveyResponseId,
          assessor_name: this.authHandler.email,
          answers: newAnswers,
        },
      },
    );
  }
}

function startAndEndDateOfWeek(w: number, y: number) {
  const offset = y === 2020 ? 4 : y === 2019 ? 5 : y === 2018 ? 6 : y === 2017 ? 7 : 9;
  const endDay = offset + 1 + (w - 1) * 7; // 1st of January + 7 days for each week
  const startDay = endDay - 6; // 1st of January + 7 days for each week minus 6 days

  const startDate = new Date(y, 0, startDay);
  const endDate = new Date(y, 0, endDay);
  return [
    `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`,
    `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`,
  ];
}
