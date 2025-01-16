import { Project } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  projectCode: string;
}

export type ResBody = KeysToCamelCase<Project>;
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
