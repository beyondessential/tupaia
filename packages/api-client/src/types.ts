export type AccessPolicyObject = Record<string, string[]>;

export type EmptyObject = Record<string, never>;

export type QueryParameters = Record<string, string | boolean | number | string[]>;

export interface AuthHandler {
  getAuthHeader: () => Promise<string>;
}

export interface SurveyResponseCreatedResponse {
  surveyResponseId: string;
  answers: string[];
}
