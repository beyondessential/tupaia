import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

// Default entities types used for multiple entity fetch routes
export interface Params {
  rootEntityCode: string;
  projectCode: string;
}
export type ResBody = KeysToCamelCase<Entity>[];
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  filter?: Record<
    string,
    string | { comparator: string; comparisonValue: string | number | string[] | number[] }
  >;
  includeRootEntity?: boolean;
}
