import { ResBody as BaseResBody, ReqQuery as BaseReqQuery } from './EntitiesRequest';

export interface Params {
  projectCode: string;
}
// Response type is the same, but re-export it to maintain structure
export type ResBody = BaseResBody;
export type ReqBody = Record<string, never>;
export interface ReqQuery extends BaseReqQuery {
  searchString: string;
  page?: number;
  pageSize?: number;
}
