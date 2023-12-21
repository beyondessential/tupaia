/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Entity } from '../../models';
import { KeysToCamelCase } from '../../../utils/casing';

export interface Params {
  entityCode: string;
  projectCode: string;
}
export type ResBody = KeysToCamelCase<Entity>;
export type ReqBody = Record<string, never>;
export interface ReqQuery {
  fields?: string[];
  filter?: Record<
    string,
    string | { comparator: string; comparisonValue: string | number | string[] | number[] }
  >;
}
