export type QueryParameters = Record<string, string | undefined>;

export type RequestBody = Record<string, unknown> | Record<string, unknown>[];

interface FetchHeaders {
  Authorization: string;
  'Content-Type'?: string;
}

export interface FetchConfig {
  method: string;
  headers: FetchHeaders;
  body?: string;
}
