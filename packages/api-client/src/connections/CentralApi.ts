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
};

export type Answers = {
  [key: string]: string; // question_code -> value
};

export class CentralApi extends BaseApi {
  public async registerUserAccount(
    userFields: Record<string, unknown>,
  ): Promise<{ userId: string; message: string }> {
    return this.connection.post('user', null, userFields);
  }

  public async createSurveyResponses(responses: SurveyResponse[]): Promise<void> {
    const BATCH_SIZE = 500;
    for (let i = 0; i < responses.length; i += BATCH_SIZE) {
      const chunk = responses.slice(i, i + BATCH_SIZE);
      await this.connection.post('surveyResponse', null, chunk);
    }
  }
}
