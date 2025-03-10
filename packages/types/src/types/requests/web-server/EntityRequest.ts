import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  entityCode: string;
  projectCode: string;
}
export type ResBody = KeysToCamelCase<Partial<Entity>>;
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  entityId?: string[];
  fields?: string[];
  filter?: Record<
    string,
    string | { comparator: string; comparisonValue: string | number | string[] | number[] }
  >;
}
