import { Entity, Project } from '../../models';
import { KeysToCamelCase } from '../../../utils';

export interface Params {
  projectCode: string;
}

export type ProjectResponse = KeysToCamelCase<Project> & {
  hasAccess: boolean;
  hasPendingAccess: boolean;
  homeEntityCode: Entity['code'];
  name: Entity['name'];
  names?: Entity['name'][];
};

export type ResBody = ProjectResponse;
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
