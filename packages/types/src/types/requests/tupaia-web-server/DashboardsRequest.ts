/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import { Dashboard, DashboardItem } from '../../models';
import { KeysToCamelCase } from '../../../utils';

export interface Params {
  projectCode: string;
  entityCode: string;
}

interface DashboardWithItems extends Dashboard {
  items: KeysToCamelCase<DashboardItem>[];
}
export type ResBody = KeysToCamelCase<DashboardWithItems>[];
export type ReqBody = Record<string, never>;
export type ReqQuery = Record<string, never>;
