export type Params = Record<string, never>;
export type ResBody = {
  contents?: Buffer;
  filePath?: string;
  type?: string;
};
export type ReqBody = Record<string, never>;
export type ReqQuery = {
  organisationUnitCode: string;
  /** Comma-separated, e.g. `SURVEY_A,SURVEY_B` */
  surveyCodes: string;
  latest?: 'true' | 'false';
  /**
   * @format iso-date-time
   */
  startDate?: string;
  /**
   * @format iso-date-time
   */
  endDate?: string;
  timeZone?: string;
  itemCode: string;
  easyReadingMode?: 'true' | 'false';
};
