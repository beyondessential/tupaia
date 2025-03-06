export interface Params {
  projectCode: string;
  entityCode: string;
  dashboardCode: string;
}
export interface ResBody {
  contents: Uint8Array;
  filePath?: string;
  type: string;
}
export type ReqBody = {
  cookieDomain: string;
  baseUrl: string;
  selectedDashboardItems?: string[];
  settings?: {
    exportWithTable: boolean;
    exportWithLabels: boolean;
    exportDescription: string | null;
    separatePagePerItem: boolean;
  };
};
export type ReqQuery = Record<string, string>;
