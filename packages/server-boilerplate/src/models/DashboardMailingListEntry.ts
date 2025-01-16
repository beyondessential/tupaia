import {
  DashboardMailingListEntryModel as BaseDashboardMailingListEntryModel,
  DashboardMailingListEntryRecord as BaseDashboardMailingListEntryRecord,
} from '@tupaia/database';
import { DashboardMailingListEntry } from '@tupaia/types';
import { Model } from './types';

export interface DashboardMailingListEntryRecord
  extends DashboardMailingListEntry,
    BaseDashboardMailingListEntryRecord {}

export interface DashboardMailingListEntryModel
  extends Model<
    BaseDashboardMailingListEntryModel,
    DashboardMailingListEntry,
    DashboardMailingListEntryRecord
  > {}
