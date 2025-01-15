export interface Params {
  reportCode: string;
}
export interface ResBody {
  data: Record<string, string | number>[];
  /**
   * @format iso-date-time
   */
  startDate?: string;
  /**
   * @format iso-date-time
   */
  endDate?: string;
}
export type ReqBody = Record<string, never>;
// Query is just forwarded, so just allow records to exist
export type ReqQuery = Record<string, string>;
