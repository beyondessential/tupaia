import { Entity, Project } from '../..';

export interface Params {
  projectCode: string;
}

interface CountryAccessObject {
  id: Entity['id'];
  name: Entity['name'];
  code: Entity['code'];
  hasAccess: boolean;
  hasPendingAccess: boolean;
}
export type ResBody = CountryAccessObject[];

export type ReqBody = Record<string, never>;
export interface ReqQuery {
  projectId: Project['id'];
}
