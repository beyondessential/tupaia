export type DraftSurveyResponse = {
  id: string;
  surveyId: string;
  surveyCode: string | null;
  surveyName: string | null;
  countryCode: string | null;
  countryName: string | null;
  entityId: string | null;
  entityName: string | null;
  startTime: Date | null;
  /** @additionalProperties true */
  formData: Record<string, unknown>;
  screenNumber: number;
  updatedAt: Date;
};

export type ResBody = {
  items: DraftSurveyResponse[];
  hasMorePages: boolean;
  pageNumber: number;
};
export type ReqQuery = {
  page?: string;
  pageLimit?: string;
  projectId?: string;
};
export type Params = Record<string, never>;
export type ReqBody = Record<string, never>;
