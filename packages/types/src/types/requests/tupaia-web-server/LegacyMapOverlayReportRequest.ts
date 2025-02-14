export interface Params {
  mapOverlayCode: string;
  legacy: string;
}
export interface ResBody {
  mapOverlayCode: string;
  measureLevel: string;
  measureOptions: Record<string, unknown>[];
  serieses: Record<string, unknown>[];
  measureData: Record<string, string | number>[];
  period?: string | null;
}
export type ReqBody = Record<string, never>;
// Query is just forwarded, so just allow records to exist
export type ReqQuery = Record<string, string>;
