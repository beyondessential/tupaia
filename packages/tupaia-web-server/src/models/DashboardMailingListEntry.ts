/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import {
  DashboardMailingListEntryModel as BaseDashboardMailingListEntryModel,
  DashboardMailingListEntryType as BaseDashboardMailingListEntryType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';
import { DashboardMailingListEntry } from '@tupaia/types';

interface DashboardMailingListEntryType
  extends DashboardMailingListEntry,
    Omit<BaseDashboardMailingListEntryType, 'id'> {}

export interface DashboardMailingListEntryModel
  extends Model<
    BaseDashboardMailingListEntryModel,
    DashboardMailingListEntry,
    DashboardMailingListEntryType
  > {}
