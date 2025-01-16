import { DashboardItemReport } from '../../models-extra';

export interface Params {
  reportCode: string;
}

export type ResBody = DashboardItemReport;
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  organisationUnitCode: string;
  projectCode: string;
  startDate: string;
  endDate: string;
}
