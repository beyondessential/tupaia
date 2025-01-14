// From https://superset.apache.org/docs/api/
export type ChartDataResponseSchema = {
  result: ChartDataResponseResult[];
};

// From https://superset.apache.org/docs/api/
export type ChartDataResponseResult = {
  annotation_data?: Record<any, string>;
  applied_filters: any[];
  cache_key?: string;
  cache_timeout?: number;
  cached_dttm?: string;
  colnames: string[];
  coltypes: number[];
  data: any[];
  error?: string;
  from_dttm?: number;
  is_cached: boolean;
  query: string;
  rejected_filters: any[];
  stacktrace?: string;
  status: 'stopped' | 'failed' | 'pending' | 'running' | 'scheduled' | 'success' | 'timed_out';
  to_dttm?: number;
};

// From https://superset.apache.org/docs/api/
export type SecurityLoginRequestBodySchema = {
  password: string;
  provider: 'db' | 'ldap';
  refresh: boolean;
  username: string;
};

// From https://superset.apache.org/docs/api/
export type SecurityLoginResponseBodySchema = {
  access_token: string;
  refresh_token: string;
};
