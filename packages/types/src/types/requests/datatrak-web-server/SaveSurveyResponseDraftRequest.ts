export type ReqBody = {
  surveyId: string;
  countryCode: string;
  entityId?: string | null;
  startTime?: string;
  /** @additionalProperties true */
  formData: Record<string, unknown>;
  screenNumber: number;
};
export type ResBody = { id: string };
export type Params = Record<string, never>;
export type ReqQuery = Record<string, never>;
