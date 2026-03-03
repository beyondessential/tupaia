export type DraftSurveyResponse = {
  id: string;
  surveyId: string;
  surveyCode: string | null;
  surveyName: string | null;
  countryCode: string | null;
  entityId: string | null;
  entityName: string | null;
  startTime: string | null;
  formData: Record<string, unknown>;
  screenNumber: number;
  updatedAt: string;
};

export type ResBody = DraftSurveyResponse[];
export type ReqQuery = Record<string, never>;
export type Params = Record<string, never>;
export type ReqBody = Record<string, never>;
