/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  DataTableModel as BaseDataTableModel,
  DataTableRecord as BaseDataTableRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import type { DataTable } from '@tupaia/types';

export type DataTableFields = Readonly<DataTable>;

export interface DataTableRecord extends DataTableFields, Omit<BaseDataTableRecord, 'id'> {}

export interface DataTableModel
  extends Model<BaseDataTableModel, DataTableFields, DataTableRecord> {}
