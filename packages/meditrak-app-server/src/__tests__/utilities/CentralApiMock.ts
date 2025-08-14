export const upsertSurveyResponsesMock = jest.fn();

export class CentralApiMock {
  public createSurveyResponses(surveyResponses: Record<string, unknown>[]) {
    upsertSurveyResponsesMock(surveyResponses);
  }
}
