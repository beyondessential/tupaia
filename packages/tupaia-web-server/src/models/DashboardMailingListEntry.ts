/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardMailingListEntryModel as BaseDashboardMailingListEntryModel,
  DashboardMailingListEntryRecord as BaseDashboardMailingListEntryRecord,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { DashboardMailingListEntry } from '@tupaia/types';

interface DashboardMailingListEntryRecord
  extends DashboardMailingListEntry,
    Omit<BaseDashboardMailingListEntryRecord, 'id'> {}

export interface DashboardMailingListEntryModel
  extends Model<
    BaseDashboardMailingListEntryModel,
    DashboardMailingListEntry,
    DashboardMailingListEntryRecord
  > {}
