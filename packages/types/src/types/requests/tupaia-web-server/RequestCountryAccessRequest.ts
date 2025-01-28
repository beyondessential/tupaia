export type Params = Record<string, never>;
export interface ResBody {
  message: string;
}
// Body is just forwarded, so allow records to exist
export type ReqBody = Record<string, unknown>;
export type ReqQuery = Record<string, never>;
