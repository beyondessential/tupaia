/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

export const upsertSurveyResponsesMock = jest.fn();

export class CentralApiMock {
  public createSurveyResponses(surveyResponses: Record<string, unknown>[]) {
    upsertSurveyResponsesMock(surveyResponses);
  }
}
