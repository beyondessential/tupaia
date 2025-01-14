export interface Params {
  entityCode: string;
  projectCode: string;
  dashboardCode: string;
}
export type UnsubscribeDashboardResponse = {
  entityCode: string;
  email: string;
  projectCode: boolean;
  dashboardCode: string;
};

export type UnsubscribeDashboardRequest = {
  email: string;
  unsubscribeTime: Date;
};

export type ResBody = UnsubscribeDashboardResponse;
export type ReqBody = UnsubscribeDashboardRequest;
export type ReqQuery = Record<string, never>;
