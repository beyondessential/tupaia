export type DraftSurveyResponse = {
  id: string;
  surveyId: string;
  surveyCode: string | null;
  surveyName: string | null;
  countryCode: string | null;
  entityId: string | null;
  entityName: string | null;
  startTime: Date | null;
  formData: Record<string, unknown>;
  screenNumber: number;
  updatedAt: Date;
};

export type ResBody = DraftSurveyResponse[];
export type ReqQuery = Record<string, never>;
export type Params = Record<string, never>;
export type ReqBody = Record<string, never>;
