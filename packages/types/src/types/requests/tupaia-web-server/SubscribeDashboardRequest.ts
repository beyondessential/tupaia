export interface Params {
  entityCode: string;
  projectCode: string;
  dashboardCode: string;
}
export type SubscribeDashboardResponse = {
  entityCode: string;
  email: string;
  projectCode: boolean;
  dashboardCode: string;
};

export type SubscribeDashboardRequest = {
  email: string;
};

export type ResBody = SubscribeDashboardResponse;
export type ReqBody = SubscribeDashboardRequest;
export type ReqQuery = Record<string, never>;
