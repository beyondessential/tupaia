export type Params = { draftId: string };
export type ReqBody = {
  entityId?: string | null;
  /** @additionalProperties true */
  formData: Record<string, unknown>;
  screenNumber: number;
};
export type ResBody = { message: string };
export type ReqQuery = Record<string, never>;
