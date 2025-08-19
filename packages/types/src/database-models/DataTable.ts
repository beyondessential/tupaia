import {
  DataTableModel as BaseDataTableModel,
  DataTableRecord as BaseDataTableRecord,
} from '@tupaia/database';
import { DataTable } from '../types/models';
import { Model } from './types';

export interface DataTableRecord extends DataTable, BaseDataTableRecord {}

export interface DataTableModel extends Model<BaseDataTableModel, DataTable, DataTableRecord> {}
