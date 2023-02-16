/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  DataTableModel as BaseDataTableModel,
  DataTableType as BaseDataTableType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import type { DataTable } from '@tupaia/types';

export type DataTableFields = Readonly<DataTable>;

export interface DataTableType extends DataTableFields, Omit<BaseDataTableType, 'id'> {}

export interface DataTableModel extends Model<BaseDataTableModel, DataTableFields, DataTableType> {}
