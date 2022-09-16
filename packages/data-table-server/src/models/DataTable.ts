/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  DataTableModel as BaseDataTableModel,
  DataTableType as BaseDataTableType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

export type DataTableFields = Readonly<{
  id: string;
  code: string;
  description: string | null;
  type: 'internal';
  config: Record<string, unknown>;
  permission_groups: string[];
}>;

export interface DataTableType extends DataTableFields, Omit<BaseDataTableType, 'id'> {}

export interface DataTableModel extends Model<BaseDataTableModel, DataTableFields, DataTableType> {}
