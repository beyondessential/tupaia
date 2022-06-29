/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  MeditrakSyncQueueModel as BaseMeditrakSyncQueueModel,
  MeditrakSyncQueueType as BaseMeditrakSyncQueueType,
} from '@tupaia/database';
import { Model } from '@tupaia/server-boilerplate';

export type MeditrakSyncQueueFields = Readonly<{
  id: string;
  type: 'update' | 'delete';
  record_type: string;
  record_id: string;
  change_time: number;
}>;

export interface MeditrakSyncQueueType
  extends MeditrakSyncQueueFields,
    Omit<BaseMeditrakSyncQueueType, 'id'> {} // Omit base `id: any` type as we explicity define as a string here

export interface MeditrakSyncQueueModel
  extends Model<BaseMeditrakSyncQueueModel, MeditrakSyncQueueFields, MeditrakSyncQueueType> {}
