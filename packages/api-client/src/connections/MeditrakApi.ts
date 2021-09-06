/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { BaseApi } from './BaseApi';

export type SurveyResponse = {
  surveyId: string;
  entityCode: string;
  timestamp: string;
  answers: Answers;
}

export type Answers = {
  [key: string]: string; // question_code -> value
}

export class MeditrakApi extends BaseApi {

  async createSurveyResponses(responses: SurveyResponse[]): Promise<void> {
    await this.connection.post('surveyResponse', null, responses);
  }

}
