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

  public async changeUserPassword(
    passwordChangeFields: Record<string, unknown>,
  ): Promise<{ message: string }> {
    return this.connection.post('me/changePassword', null, passwordChangeFields);
  }

  public async createSurveyResponses(responses: SurveyResponse[]): Promise<void> {
    const BATCH_SIZE = 500;
    for (let i = 0; i < responses.length; i += BATCH_SIZE) {
      const chunk = responses.slice(i, i + BATCH_SIZE);
      await this.connection.post('surveyResponse', null, chunk);
    }
  }

  /**
   * Solely for use by meditrak-app-server. Should be deprecated once RN-556 is implemented
   * @param changes Changes from the meditrak-app sync
   */
  public async meditrak_only_pushChanges(changes: unknown[]): Promise<{ message: string }> {
    return this.connection.post('changes', null, changes as any[]);
  }
}
